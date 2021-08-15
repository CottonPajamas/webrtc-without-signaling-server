# taken from https://gist.github.com/DannyHinshaw/a3ac5991d66a2fe6d97a569c6cdac534
# generate server.xml with the following command:
#    openssl req -new -x509 -keyout key.pem -out server.pem -days 365 -nodes
# run as follows:
#    sudo python3 server.py
# then in your browser, visit:
#    https://localhost:4443

import http.server
import ssl

server_address = ('localhost', 8080)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket,
                               server_side=True,
                               certfile="server.pem",
                               keyfile="key.pem",
                               ssl_version=ssl.PROTOCOL_TLS)
httpd.serve_forever()