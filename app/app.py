#!/usr/bin/env/python2

# Application Library imports
from bottle import Bottle, request, static_file
from bottle_sqlite import Plugin
import setup as setup_module

# Standard Library imports
from json import dumps, loads
from hashlib import sha1
from functools import partial
from imghdr import what
import logging

logging.basicConfig(filename='/tmp/log.txt', format=logging.BASIC_FORMAT)

app = Bottle()
database = './alpr.db'
plugin = Plugin(dbfile=database)
app.install(plugin)


# Handle main page and static
@app.route('/')
def main_page():
    return static_file('index.html', root='./')


@app.route('/assets/<filepath:path>')
def server_static(filepath):
    return static_file(filepath, root='./assets/')


@app.route('/images/<filepath:path>')
def server_static(filepath):
    return static_file(filepath, root='./images/')


@app.route('/setup')
def setup():
    setup_module.setup_database(database)
    setup_module.setup_directories()


# Handle API calls
@app.route('/api/v1/results')
def results_list(db):
    results = db.execute('''SELECT
        id, date, plate, proc_time_ms, confidence, hash
        FROM results''').fetchall()
    return dumps([dict(x) for x in results])


@app.post('/api/v1/upload')
def upload_result(db):
    upload = request.files.get('img')

    if not what(upload.file):
        raise TypeError("Not an Image")

    # Break the file into multiple of 256-byte (8192, 32768 etc) chunks
    # and feed them to SHA256 consecutively using update()
    # SHA1 - 160
    # Useful for large files
    upload_hash = sha1()
    blocksize = 61440 # 160 * 384
    for chunk in iter(partial(upload.file.read, blocksize), b''):
        upload_hash.update(chunk)
    upload_hash = upload_hash.hexdigest()

    upload.file.seek(0)
    try:
        upload.save('./images/' + upload_hash[0] + '/' + upload_hash)
    except:
        raise
    upload.file.close()

    alpr_json = loads(request.forms.get('data'))
    results = alpr_json["results"]
    logging.error(type(results))

    for result in results:
        logging.error(result["matches_template"])
        if result["matches_template"] == 1:
            db.execute('''INSERT
                       INTO results (plate, proc_time_ms, confidence, hash)
                       VALUES (?, ?, ?, ?)''',
                       (result["plate"], result["processing_time_ms"],
                        result["confidence"], upload_hash, ))
            db.commit()
