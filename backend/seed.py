import pymysql
from datetime import datetime, timedelta

def get_connection(db_name):
    return pymysql.connect(
        host='localhost',
        user='root',
        password='root',
        database=db_name,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )

def seed_rh():
    print("Seeding lila_rh...")
    try:
        conn = get_connection('lila_rh')
        with conn.cursor() as cursor:
            cursor.execute("SET FOREIGN_KEY_CHECKS=0;")
            
            # Roles
            cursor.execute("INSERT IGNORE INTO roles (id, rol, descripcion) VALUES (1, 'Mesero', 'Atencion mesas'), (2, 'Cajero', 'Cobro');")
            
            # Sucursal
            cursor.execute("INSERT IGNORE INTO sucursal (id, nombre_sucursal, ubicacion, fecha_inauguracion) VALUES (1, 'Sucursal Principal', 'Av. Central 123', NOW());")
            
            # Employees
            employees = [
                (1, 'Carolina', 'Rios', 'caro@lila.com', 'Mesero', 15.00, 1, 1),
                (2, 'Marcos', 'Vidal', 'marcos@lila.com', 'Mesero', 15.00, 1, 1),
                (3, 'Carlos', 'Fuentes', 'carlos@lila.com', 'Cajero', 18.00, 1, 2)
            ]
            for emp in employees:
                cursor.execute("""
                    INSERT IGNORE INTO employees (id, nombre, apellido, email, puesto, tarifa_hora, sucursal_id, rol_id, is_active)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)
                """, emp)
                
            cursor.execute("SET FOREIGN_KEY_CHECKS=1;")
        conn.close()
        print("lila_rh seeded successfully.")
    except Exception as e:
        print(f"Error seeding RH: {e}")

def seed_production():
    print("Seeding lila_produccion...")
    try:
        conn = get_connection('lila_produccion')
        with conn.cursor() as cursor:
            # Products
            products = [
                (1, 'Entrecot de Res 300g', 'Producto venta', 'Unidad', 2500, 50),
                (2, 'Pollo al Limón', 'Producto venta', 'Unidad', 1200, 40),
                (3, 'Papas Rústicas', 'Producto venta', 'Unidad', 300, 100),
                (4, 'Ensalada César', 'Producto venta', 'Unidad', 800, 30),
                (5, 'Agua Mineral', 'Producto venta', 'Unidad', 150, 200),
                (6, 'Copa de Malbec', 'Producto venta', 'Unidad', 400, 150)
            ]
            for p in products:
                cursor.execute("""
                    INSERT IGNORE INTO products (id, name, product_type, medida, costo, stock, activo)
                    VALUES (%s, %s, %s, %s, %s, %s, 1)
                """, p)
        conn.close()
        print("lila_produccion seeded successfully.")
    except Exception as e:
        print(f"Error seeding Production: {e}")

def seed_servicio():
    print("Seeding lila_servicio...")
    try:
        conn = get_connection('lila_servicio')
        with conn.cursor() as cursor:
            cursor.execute("SET FOREIGN_KEY_CHECKS=0;")
            
            # Mesas
            mesas = [
                (1, 1, 4, 'square', 'Interior', 'Libre', None),
                (2, 2, 2, 'circle', 'Interior', 'Libre', None),
                (3, 3, 2, 'square', 'Terraza', 'Libre', None),
                (4, 4, 6, 'square', 'Interior', 'Libre', None),
                (5, 5, 4, 'circle', 'Terraza', 'Libre', None),
                (6, 6, 4, 'square', 'VIP', 'Libre', None),
                (7, 7, 2, 'square', 'Barra', 'Libre', None)
            ]
            for m in mesas:
                cursor.execute("""
                    INSERT IGNORE INTO mesas (id, numero, capacidad, forma, zona, estado_actual, id_mesero_asignado)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, m)

            # Inventario Local
            inventario = [
                (1, 1, 'Entrecot de Res 300g', 'Carnes', 50, 'unidad', 10, 100, 2500),
                (2, 2, 'Pollo al Limón', 'Carnes', 40, 'unidad', 10, 100, 1200),
                (3, 3, 'Papas Rústicas', 'Vegetales', 100, 'unidad', 20, 200, 300),
                (4, 4, 'Ensalada César', 'Vegetales', 30, 'unidad', 10, 50, 800),
                (5, 5, 'Agua Mineral', 'Bebidas', 200, 'unidad', 50, 500, 150),
                (6, 6, 'Copa de Malbec', 'Bebidas', 150, 'unidad', 20, 300, 400)
            ]
            for i in inventario:
                cursor.execute("""
                    INSERT IGNORE INTO inventario_local (id, id_producto_origen, nombre_producto, categoria, cantidad_actual, unidad, min_stock, max_stock, costo_unitario)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, i)
            
            # Caja
            cursor.execute("INSERT IGNORE INTO cajas (id, nombre, estado) VALUES (1, 'Caja Principal', 'Activa');")

            # Sesiones_caja
            cursor.execute("""
                INSERT IGNORE INTO sesiones_caja (id, id_caja, id_usuario, monto_inicial, estado, fecha_apertura)
                VALUES (1, 1, 3, 1000.00, 'Abierta', NOW())
            """)

            # Pedidos
            now = datetime.now()
            pedidos = [
                (1, 1, 1, 1, 4, 'Pagado', 5000, 525, 0, 5525, now - timedelta(hours=2)),
                (2, 1, 2, 2, 2, 'Pagado', 2400, 252, 0, 2652, now - timedelta(hours=1)),
                (3, 1, 1, 3, 2, 'En Preparacion', 3000, 315, 0, 3315, now - timedelta(minutes=10))
            ]
            for p in pedidos:
                cursor.execute("""
                    INSERT IGNORE INTO pedidos (id, id_sesion, id_mesero, id_mesa, cubiertos, estado_pedido, subtotal, impuestos, descuentos, total, fecha_creacion)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, p)

            # Detalles Pedido
            detalles = [
                (1, 1, 1, 'Entrecot de Res 300g', 2, 2500, 5000, 'Listo', 'Fuegos', ''),
                (2, 2, 2, 'Pollo al Limón', 2, 1200, 2400, 'Listo', 'Fuegos', ''),
                (3, 3, 1, 'Entrecot de Res 300g', 1, 2500, 2500, 'Pendiente', 'Fuegos', 'Término medio'),
                (4, 3, 3, 'Papas Rústicas', 1, 300, 300, 'Pendiente', 'Fuegos', '')
            ]
            for d in detalles:
                cursor.execute("""
                    INSERT IGNORE INTO detalles_pedido (id, id_pedido, id_producto, nombre_producto, cantidad, precio_unitario, subtotal, estado_preparacion, estacion_cocina, notas)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, d)

            cursor.execute("SET FOREIGN_KEY_CHECKS=1;")
        conn.close()
        print("lila_servicio seeded successfully.")
    except Exception as e:
        print(f"Error seeding Servicio: {e}")

if __name__ == "__main__":
    seed_rh()
    seed_production()
    seed_servicio()
    print("Seed completo!")
