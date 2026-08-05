import sqlite3
import os

path = 'db.sqlite3'
print('DB exists', os.path.exists(path))
if os.path.exists(path):
    conn = sqlite3.connect(path)
    cur = conn.cursor()
    for table in ['empresa', 'auth_user', 'plan_licencia', 'licencia_token', 'sucursal', 'configuracion_landing']:
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
        exists = cur.fetchone() is not None
        if exists:
            cur.execute(f"SELECT count(*) FROM {table}")
            print(table, cur.fetchone()[0])
        else:
            print(table, 'MISSING')
    print('--- empresas ---')
    try:
        for row in cur.execute('SELECT id,nombre,slug,telefono,whatsapp,activa FROM empresa').fetchall():
            print(row)
    except Exception as e:
        print('empresa error', e)
    print('--- licencias ---')
    try:
        for row in cur.execute('SELECT id,empresa_id,estado,fecha_vencimiento FROM licencia_token').fetchall():
            print(row)
    except Exception as e:
        print('licencia error', e)
    print('--- planes ---')
    try:
        for row in cur.execute('SELECT id,nombre,precio_mensual FROM plan_licencia').fetchall():
            print(row)
    except Exception as e:
        print('planes error', e)
    conn.close()
