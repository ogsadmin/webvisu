import SimpleHTTPServer
import SocketServer
import cgi

import os.path
import os

PORT = 8080

# Definitionen von Variablen-Typen, wie sie wahrscheinlich in den ARTI-Adressen verwendet werden
VAR_TYPE_BOOL = 0
VAR_TYPE_INT = 1
VAR_TYPE_BYTE = 2
VAR_TYPE_WORD = 3
VAR_TYPE_DINT = 4
VAR_TYPE_DWORD = 5
VAR_TYPE_REAL = 6
VAR_TYPE_TIME = 7
VAR_TYPE_STRING = 8
VAR_TYPE_ARRAY = 9
VAR_TYPE_ENUM = 10
VAR_TYPE_USERDEF = 11
VAR_TYPE_BITORBYTE = 12
VAR_TYPE_POINTER = 13
VAR_TYPE_SINT = 14
VAR_TYPE_USINT = 15
VAR_TYPE_UINT = 16
VAR_TYPE_UDINT = 17
VAR_TYPE_DATE = 18
VAR_TYPE_TOD = 19
VAR_TYPE_DT = 20
VAR_TYPE_VOID = 21
VAR_TYPE_LREAL = 22
VAR_TYPE_REF = 23
VAR_TYPE_NONE = 24

_filenamesCaseInsensitive = dict()

class CustomHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def __init__(self, req, client_addr, server):
        SimpleHTTPServer.SimpleHTTPRequestHandler.__init__(self, req, client_addr, server)

    def do_GET(self):
        # cut off query string (if any)
        if '?' in self.path:
            self.path = self.path.split('?')[0]
        
        # check filename and map to _filenamesCaseInsensitive unless exists
        if not os.path.isfile('./' + self.path):
            if self.path.lower() in _filenamesCaseInsensitive:
                if os.path.isfile('./' + _filenamesCaseInsensitive[self.path.lower()]):
                    #print "change", self.path, "to", _filenamesCaseInsensitive[self.path.lower()]
                    self.path = _filenamesCaseInsensitive[self.path.lower()]

        SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        #print("do_POST")
        data_string = self.rfile.read(int(self.headers['Content-Length']))

        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

        #print(data_string)
        # z.B. |0|36 | 0|4|21303|21|8 | 1|4|21324|21|8|2|4|21345|21|8|3|4|21366|21|8|4|4|21387|21|8|5|4|21408|21|8|6|4|21429|21|8|7|4|21450|21|8|8|4|21301|2|1|9|4|21053|41|8|10|4|21094|41|8|11|4|21135|41|8|12|4|21217|41|8|13|4|21258|41|8|14|4|21299|2|1|15|4|21473|4|5|16|4|18450|21|8|17|4|20673|1|0|18|4|20667|1|0|19|4|20676|1|0|20|4|20670|1|0|21|4|20674|1|0|22|4|20668|1|0|23|4|20677|1|0|24|4|20671|1|0|25|4|20669|1|0|26|4|20678|1|0|27|4|20672|1|0|28|4|22944|1|0|29|4|24465|81|8|30|4|24546|81|8|31|4|24627|81|8|32|4|20687|2|1|33|4|20683|2|1|34|4|20691|1|0|35|4|22943|1|0|

        answer = '|'

        fields = data_string.split('|')
        if int(fields[1]) == 0:
            varCount = int(fields[2])

            fieldCounter = 3
            varCounter = 0

            while varCounter < varCount:
                if int(fields[fieldCounter]) != varCounter:
                    print("ERROR: Feldcount", varCounter, "falsch")
                    return
                fieldCounter += 1
                addr1 = int(fields[fieldCounter])
                fieldCounter += 1
                addr2 = int(fields[fieldCounter])
                fieldCounter += 1
                numBytes = int(fields[fieldCounter])
                fieldCounter += 1
                varType = int(fields[fieldCounter])
                fieldCounter += 1

                # Dummydaten einfüllen - falls es Sinn macht
                if(varType == VAR_TYPE_DATE):
                    answer += '1498780800|'                 # d#2017-06-30
                elif(varType == VAR_TYPE_TOD):
                    answer += '45296000|'                   # tod#12:34:56 (ms)
                elif(varType == VAR_TYPE_DT):
                    answer += '1498826096|'                 # dt#2017-06-30-12:34:56
                elif(varType == VAR_TYPE_TIME):
                    answer += '358000|'                     # t#5m58s (ms)
                elif(varType == VAR_TYPE_STRING):
                    answer += 'hallo|'
                else:
                    # wir antworten mal überall sonst mit "0"
                    answer += '0|'

                varCounter+=1

            #print("answer", answer)
            self.wfile.write(answer)


class MyTCPServer(SocketServer.ThreadingTCPServer):
    allow_reuse_address = True


if __name__ == '__main__':
    # fill _filenamesCaseInsensitive dict
    for dirname, dirnames, filenames in os.walk('.'):
        for filename in filenames:
            # cut off "." at the beginning
            file = os.path.join(dirname, filename)[1:]
            #print(file)
            _filenamesCaseInsensitive[file.lower()] = file

    httpd = MyTCPServer(('0.0.0.0', PORT), CustomHandler)
    httpd.allow_reuse_address = True
    print "Serving at port", PORT
    httpd.serve_forever()
