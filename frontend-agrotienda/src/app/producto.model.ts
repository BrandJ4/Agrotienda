export interface Producto {
    id?: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    oferta?: boolean;
    descuentoPorcentaje?: number | null;
    categoria?: string;
    imagenUrl?: string;
}
