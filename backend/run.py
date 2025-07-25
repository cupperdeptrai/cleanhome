"""
CleanHome Backend - Flask Application Entry Point
"""

from app import create_app

# Tạo Flask app
app = create_app()

if __name__ == '__main__':
    # Chạy development server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )

