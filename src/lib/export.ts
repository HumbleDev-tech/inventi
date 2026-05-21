/**
 * Utilidad genérica para exportar datos en formato CSV con soporte UTF-8 (BOM para Excel).
 */
export function exportToCSV<T>(
  data: T[],
  columns: { header: string; key: keyof T | ((item: T) => string | number | null | undefined) }[],
  filename: string
) {
  if (!data || !data.length) {
    alert('No hay datos disponibles para exportar.');
    return;
  }

  // Crear la cabecera del CSV
  const headers = columns.map((col) => escapeCSV(col.header)).join(';');

  // Crear las filas del CSV
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let value: any = '';
        if (typeof col.key === 'function') {
          value = col.key(item);
        } else {
          value = item[col.key];
        }
        
        // Formatear si es null o undefined
        if (value === null || value === undefined) {
          value = '';
        }
        
        return escapeCSV(value.toString());
      })
      .join(';');
  });

  // Unir cabeceras e hilos usando salto de línea CRLF para compatibilidad con Windows/Excel
  const csvContent = [headers, ...rows].join('\r\n');

  // Agregar la marca de orden de bytes (BOM) UTF-8 para asegurar que MS Excel interprete correctamente acentos y la Ñ
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Trigger del navegador
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Escapa valores especiales para formato CSV.
 */
function escapeCSV(val: string): string {
  // Reemplazar saltos de línea y tabuladores por espacios simples
  let cleanVal = val.replace(/[\n\r\t]+/g, ' ');
  
  // Si contiene punto y coma, comillas dobles, o comas, envolvemos en comillas dobles
  // y duplicamos las comillas dobles internas según estándar RFC 4180
  if (cleanVal.includes(';') || cleanVal.includes('"') || cleanVal.includes(',')) {
    cleanVal = `"${cleanVal.replace(/"/g, '""')}"`;
  }
  
  return cleanVal;
}
