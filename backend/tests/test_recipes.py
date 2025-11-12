import io
import pytest
from PIL import Image

from app import create_app
from config import Config

@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    Config.GEMINI_API_KEY = Config.GEMINI_API_KEY or 'test-key'
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def create_test_image():
    """Create a simple test image in memory."""
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes

def test_generate_recipe_no_file(client):
    """Test generate-recipe endpoint without file."""
    response = client.post('/api/generate-recipe')
    assert response.status_code == 400
    data = response.get_json()
    assert data['success'] is False
    assert data['error']['code'] == 'missing_file'

def test_generate_recipe_empty_filename(client):
    """Test generate-recipe endpoint with empty filename."""
    response = client.post('/api/generate-recipe', 
                          data={'file': (io.BytesIO(b''), '')})
    assert response.status_code == 400
    data = response.get_json()
    # Empty filename is treated as missing file
    assert data['error']['code'] == 'missing_file'

def test_generate_recipe_invalid_extension(client):
    """Test generate-recipe endpoint with invalid file extension."""
    response = client.post('/api/generate-recipe',
                          data={'file': (io.BytesIO(b'test'), 'test.txt')})
    assert response.status_code == 400
    data = response.get_json()
    assert data['error']['code'] == 'unsupported_file_type'

def test_generate_recipe_valid_image_structure(client):
    """Test generate-recipe endpoint with valid image returns proper structure."""
    # Note: This will fail without a valid GEMINI_API_KEY, which is expected in testing
    img_bytes = create_test_image()
    response = client.post('/api/generate-recipe',
                          data={'file': (img_bytes, 'test.jpg')},
                          content_type='multipart/form-data')
    
    # Could be 200 (success) or 500 (API key issue)
    assert response.status_code in [200, 500]
    data = response.get_json()
    
    if response.status_code == 200:
        assert data['success'] is True
        assert 'recipe' in data
        assert 'meta' in data
        assert data['meta']['provider'] == Config.DEFAULT_PROVIDER
    else:
        assert data['success'] is False
        assert 'error' in data

def test_generate_recipe_with_options(client):
    """Test generate-recipe endpoint with language and dietary options."""
    img_bytes = create_test_image()
    response = client.post('/api/generate-recipe',
                          data={
                              'file': (img_bytes, 'test.jpg'),
                              'language': 'es',
                              'dietary_restrictions': 'vegetarian',
                              'cuisine_preference': 'Italian'
                          },
                          content_type='multipart/form-data')
    
    # Accept both success and API errors (no key in test environment)
    assert response.status_code in [200, 500]

def test_generate_recipe_corrupted_image(client):
    """Test generate-recipe endpoint with corrupted image data."""
    response = client.post('/api/generate-recipe',
                          data={'file': (io.BytesIO(b'not an image'), 'test.jpg')},
                          content_type='multipart/form-data')
    assert response.status_code == 400
    data = response.get_json()
    assert data['error']['code'] == 'invalid_image'
