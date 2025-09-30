import pyodbc
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Habilita CORS para toda la aplicación

# --- Configuración de la conexión a SQL Server ---
# Asegúrate de tener instalado el driver ODBC para SQL Server
SERVER = 'NeilC-SRV' # Nombre del servidor o IP
DATABASE = 'MotoliderDB'
USERNAME = 'dev'
PASSWORD = '123456'

connection_string = f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={SERVER};DATABASE={DATABASE};UID={USERNAME};PWD={PASSWORD}'

def get_db_connection():
    try:
        conn = pyodbc.connect(connection_string)
        return conn
    except Exception as e:
        print(f"Error al conectar a la base de datos: {e}")
        return None

# --- Creación de la base de datos para las imágenes (si no existe) ---
# Usaremos SQLite para simplicidad. Flask lo manejará automáticamente.
# Esta es una alternativa a crear una nueva tabla en tu SQL Server principal.
# (Más adelante crearemos la tabla y los endpoints para las imágenes)


@app.route('/api/product/<search_term>', methods=['GET'])
def get_product(search_term):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    cursor = conn.cursor()
    # Consulta para buscar por código de producto, descripción o código de barras
    # Usamos LIKE para búsquedas parciales
    query = """
        SELECT
            CodProd,
            Descrip,
            Precio1, -- Ajusta los campos de precio que necesites
            Precio2,
            Precio3,
            Marca,   -- Ejemplo de campo adicional
            Refere   -- Código de barras
        FROM SAPROD
        WHERE CodProd LIKE ? OR Descrip LIKE ? OR Refere = ?
    """
    # El formato de los parámetros puede variar ligeramente según el driver ODBC
    params = (f'%{search_term}%', f'%{search_term}%', search_term)

    try:
        cursor.execute(query, params)
        # Convertimos el resultado a un formato de diccionario para enviarlo como JSON
        columns = [column[0] for column in cursor.description]
        products = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return jsonify(products)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@app.route('/api/categories', methods=['GET'])
def get_categories():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    cursor = conn.cursor()
    # SAINSTA es la tabla de instancias/departamentos/categorías en Saint
    query = "SELECT CodInst, Descrip FROM SAINSTA"

    try:
        cursor.execute(query)
        columns = [column[0] for column in cursor.description]
        categories = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return jsonify(categories)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# Este código le dice a Flask: "Si alguien pide una URL que empiece con /images/, 
# busca el archivo con ese nombre dentro de la carpeta product_images y envíalo."

@app.route('/images/<filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# --- El Bloque de Arranque ---
# Este código solo se ejecuta cuando corres el script directamente con "python app.py"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')