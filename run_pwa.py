import os
import sys
import socket
import shutil
import subprocess

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__)) # terpila_pwa
PWA_DIR = PROJECT_DIR
AUDIO_DIR = os.path.join(PWA_DIR, "audio")
# Android is in sibling folder 'terpila'
ANDROID_RAW_DIR = os.path.join(os.path.dirname(PROJECT_DIR), "terpila", "app", "src", "main", "res", "raw")
ARTIFACTS_DIR = r"C:\Users\evgen\.gemini\antigravity\brain\41688fdb-cdfc-442d-94b7-d7dd3dec17a6\artifacts"

def install_reqs():
    print("Installing requirements for QR-code and Icon generation...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow", "qrcode"])

def copy_assets():
    print("Copying audio assets from Android project...")
    os.makedirs(AUDIO_DIR, exist_ok=True)
    for i in range(6):
        src = os.path.join(ANDROID_RAW_DIR, f"phrase_{i}.mp3")
        dest = os.path.join(AUDIO_DIR, f"phrase_{i}.mp3")
        if os.path.exists(src):
            shutil.copy(src, dest)
            print(f"Copied {src} -> {dest}")
        else:
            print(f"Warning: Source audio {src} not found!")

def generate_icon():
    icon_path = os.path.join(PWA_DIR, "icon.png")
    if os.path.exists(icon_path):
        return
        
    print("Generating custom pink icon.png...")
    try:
        from PIL import Image, ImageDraw
        img = Image.new('RGB', (192, 192), color='#E91E63')
        d = ImageDraw.Draw(img)
        # Draw a white T
        d.rectangle([50, 40, 142, 65], fill="white")
        d.rectangle([83, 65, 109, 150], fill="white")
        img.save(icon_path)
        print(f"Icon generated at {icon_path}")
    except Exception as e:
        print("Failed to generate custom icon with Pillow:", e)

def get_all_ips():
    ips = []
    try:
        host_name = socket.gethostname()
        for ip in socket.gethostbyname_ex(host_name)[2]:
            if not ip.startswith("127."):
                ips.append(ip)
    except Exception:
        pass
    if not ips:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(('10.255.255.255', 1))
            ips.append(s.getsockname()[0])
            s.close()
        except Exception:
            ips.append('127.0.0.1')
    return list(set(ips))

def start_server():
    import http.server
    import socketserver
    
    ips = get_all_ips()
    
    class MyHTTPHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            super().end_headers()
            
    handler = MyHTTPHandler
    
    # Try different ports in case 8000 is occupied
    for port in range(8000, 8020):
        try:
            # We bind to "" to listen on all network interfaces
            with socketserver.TCPServer(("", port), handler) as httpd:
                PORT = port
                url = f"http://localhost:{PORT}"
                
                print("\n" + "="*50)
                print(f"PWA SERVER IS RUNNING ON PORT {PORT}!")
                print(f"Local address: {url}")
                print("Network addresses (for iPhone):")
                
                primary_url = ""
                for ip in ips:
                    net_url = f"http://{ip}:{PORT}"
                    print(f"  - {net_url}")
                    # Prioritize 192.168. (typical home network)
                    if ip.startswith("192.168."):
                        primary_url = net_url
                        
                if not primary_url and ips:
                    primary_url = f"http://{ips[0]}:{PORT}"
                    
                print("="*50)
                
                # Generate QR code image
                try:
                    import qrcode
                    qr = qrcode.QRCode(version=1, box_size=10, border=4)
                    qr.add_data(primary_url)
                    qr.make(fit=True)
                    img = qr.make_image(fill_color="black", back_color="white")
                    
                    # Save to PWA directory
                    pwa_qr_path = os.path.join(PWA_DIR, "qr.png")
                    img.save(pwa_qr_path)
                    print(f"QR code saved to PWA folder: {pwa_qr_path}")
                    
                    # Save to Artifacts directory for Gemini UI representation
                    if os.path.exists(ARTIFACTS_DIR):
                        artifact_qr_path = os.path.join(ARTIFACTS_DIR, "qr.png")
                        img.save(artifact_qr_path)
                        print(f"QR code saved to Artifacts folder: {artifact_qr_path}")
                except Exception as e:
                    print("Could not generate QR code image:", e)

                print("\nPress Ctrl+C to stop the server.\n" + "="*50)
                
                os.chdir(PWA_DIR)
                httpd.serve_forever()
                break
        except OSError:
            print(f"Port {port} is occupied, trying next...")
            continue

if __name__ == "__main__":
    install_reqs()
    copy_assets()
    generate_icon()
    start_server()
