import pyodbc
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename

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

# --- CONFIGURACIÓN DEL DIRECTORIO DE IMÁGENES ---
# Define el nombre de la carpeta donde se guardarán las imágenes
UPLOAD_FOLDER = 'product_images' 
# Le dice a Flask dónde está esa carpeta
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Se asegura de que la carpeta exista. Si no, la crea.
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
# --------------------------------------------------

# ... (aquí empiezan tus @app.route, como la conexión a la BD, etc.)

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
        p.CodProd,
        p.Descrip,
        p.Precio1,
        p.Precio2,
        p.Precio3,
        p.Marca,
        p.Refere,
        i.ImagePath
    FROM 
        SAPROD AS p
    LEFT JOIN 
        product_images AS i ON p.CodProd = i.CodProd
    WHERE 
        p.CodProd LIKE ? OR p.Descrip LIKE ? OR p.Refere = ?
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

@app.route('/api/product/upload_image', methods=['POST'])
def upload_image():
    if 'image' not in request.files or 'CodProd' not in request.form:
        return jsonify({"error": "Faltan datos (imagen o CodProd)"}), 400

    file = request.files['image']
    cod_prod = request.form['CodProd']

    if file.filename == '':
        return jsonify({"error": "No se seleccionó ningún archivo"}), 400

    if file:
        # Crea un nombre de archivo seguro para evitar problemas
        filename = secure_filename(f"{cod_prod}.jpg") # Forzamos la extensión
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Lógica para guardar la ruta en la base de datos
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

        cursor = conn.cursor()
        query = """
            MERGE product_images AS target
            USING (SELECT ? AS CodProd, ? AS ImagePath) AS source
            ON (target.CodProd = source.CodProd)
            WHEN MATCHED THEN
                UPDATE SET ImagePath = source.ImagePath
            WHEN NOT MATCHED THEN
                INSERT (CodProd, ImagePath) VALUES (source.CodProd, source.ImagePath);
        """
        try:
            cursor.execute(query, cod_prod, filename)
            conn.commit()
            return jsonify({"success": "Imagen subida correctamente", "path": filename}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')