"""Simple local server for the MVP static app."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


if __name__ == "__main__":
    app_dir = Path(__file__).parent
    handler = partial(SimpleHTTPRequestHandler, directory=str(app_dir))

    server = ThreadingHTTPServer(("0.0.0.0", 8000), handler)
    print("Serving app on http://0.0.0.0:8000")
    server.serve_forever()
