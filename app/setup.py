#!/usr/bin/env python2

import os
import sqlite3


def setup_database(database):

    con = sqlite3.connect(database)

    # Create tables
    con.execute('''CREATE TABLE IF NOT EXISTS results
     (id INTEGER PRIMARY KEY,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      plate CHAR(32) NOT NULL,
      proc_time_ms REAL NOT NULL,
      confidence REAL NOT NULL,
      hash CHAR(32) NOT NULL)''')

    con.commit()


def setup_directories():
    if not os.path.exists('./images'):
        os.mkdir('./images')

    for h in range(0x10):
        h = format(h, '01x')
        path = './images/' + h
        if not os.path.exists(path):
            os.mkdir(path)


if __name__ == "__main__":
    setup_database('./alpr.db')
    setup_directories()