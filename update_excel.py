import openpyxl
import sys

file_path = r"C:\Users\Joaqu\OneDrive\Escritorio\AguaSabia\AGUASABIA\Gestion\5.1 Carta Gantt (1) (1).xlsx"
try:
    wb = openpyxl.load_workbook(file_path)
    ws = wb.active
    
    replacements = {
        "backend-setup.md": "configuracion_backend.md",
        "database-documentation.md": "documentacion_base_datos.md",
        "api-documentation.md": "documentacion_api.md",
        "traceability-matrix.md": "matriz_trazabilidad.md",
        "testing-environment.md": "entorno_pruebas.md",
        "project-structure.md": "estructura_proyecto.md",
        "error-handling.md": "manejo_errores.md",
        "backup-and-restore.md": "respaldo_recuperacion.md"
    }
    
    # We also want to adapt tasks to the new state: 
    # instead of "riego/agricultores", maybe something related to "consulta territorial".
    task_replacements = {
        "Recomendación de riego": "Consulta territorial",
        "Recomendacion de riego": "Consulta territorial",
        "Módulo Agricultores": "Módulo Usuarios",
        "Módulo Parcelas": "Módulo Territorio",
        "Agricultores": "Usuarios",
        "Parcelas": "Polígonos"
    }

    changes_made = 0
    for row in ws.iter_rows():
        for cell in row:
            if isinstance(cell.value, str):
                new_val = cell.value
                for k, v in replacements.items():
                    if k in new_val:
                        new_val = new_val.replace(k, v)
                for k, v in task_replacements.items():
                    if k in new_val:
                        new_val = new_val.replace(k, v)
                        
                if new_val != cell.value:
                    print(f"Replacing '{cell.value}' -> '{new_val}'")
                    cell.value = new_val
                    changes_made += 1

    if changes_made > 0:
        wb.save(file_path)
        print(f"Saved {changes_made} changes.")
    else:
        print("No changes needed.")

except Exception as e:
    print(f"Error: {e}")
