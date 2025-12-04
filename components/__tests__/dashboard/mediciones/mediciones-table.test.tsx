import { render, screen, fireEvent } from '@testing-library/react';
import { MedicionesTable } from '../../../dashboard/mediciones/mediciones-table';
import { Medicion } from '@/lib/types';

// Mock de las dependencias de UI
jest.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({ children, colSpan }: { children: React.ReactNode; colSpan?: number }) => (
    <td colSpan={colSpan}>{children}</td>
  ),
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableRow: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <tr className={className}>{children}</tr>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

describe('MedicionesTable', () => {
  const mockMediciones: Medicion[] = [
    {
      id: 1,
      valor: 25.5,
      fecha_medicion: new Date('2024-01-15'),
      notas: 'Medición de prueba',
      created_at: new Date('2024-01-15'),
      updated_at: null,
      deleted_at: null,
      lugar: {
        id: 1,
        nombre: 'Lugar de prueba',
        nota: null,
        latitud: null,
        longitud: null,
        creado_por_id: null,
        created_at: new Date('2024-01-01'),
        deleted_at: null,
      },
      unidad: {
        id: 1,
        nombre: 'Unidad de prueba',
        sigla: 'kg',
        creado_por_id: null,
        deleted_at: null,
      },
      tipo: {
        id: 1,
        codigo: 'TEMP',
        descripcion: 'Temperatura',
      },
      registrado_por: {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        activo: true,
        created_at: new Date('2024-01-01'),
      },
    },
    {
      id: 2,
      valor: 30.2,
      fecha_medicion: new Date('2024-01-16'),
      notas: 'Otra medición',
      created_at: new Date('2024-01-16'),
      updated_at: null,
      deleted_at: null,
      lugar: {
        id: 2,
        nombre: 'Otro lugar',
        nota: null,
        latitud: null,
        longitud: null,
        creado_por_id: null,
        created_at: new Date('2024-01-01'),
        deleted_at: null,
      },
      unidad: {
        id: 2,
        nombre: 'Otra unidad',
        sigla: 'm',
        creado_por_id: null,
        deleted_at: null,
      },
      tipo: {
        id: 2,
        codigo: 'PRES',
        descripcion: 'Presión',
      },
      registrado_por: {
        id: 2,
        nombre: 'María García',
        email: 'maria@example.com',
        activo: true,
        created_at: new Date('2024-01-01'),
      },
    },
  ];

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renderizado de la tabla', () => {
    it('debe renderizar la tabla con datos', () => {
      const mockPagination = {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
      const mockOnPageChange = jest.fn();

      render(
        <MedicionesTable
          mediciones={mockMediciones}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
        />
      );

      // Verificar que se renderizan los encabezados
      expect(screen.getByText('Fecha')).toBeInTheDocument();
      expect(screen.getByText('Lugar')).toBeInTheDocument();
      expect(screen.getByText('Valor')).toBeInTheDocument();
      expect(screen.getByText('Tipo')).toBeInTheDocument();
      expect(screen.getByText('Autor')).toBeInTheDocument();
      expect(screen.getByText('Notas')).toBeInTheDocument();
      expect(screen.getByText('Acciones')).toBeInTheDocument();
    });

    it('debe renderizar las filas de mediciones', () => {
      const mockPagination = {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
      const mockOnPageChange = jest.fn();

      render(
        <MedicionesTable
          mediciones={mockMediciones}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
        />
      );

      // Verificar que se renderizan los datos de las mediciones
      expect(screen.getByText('Lugar de prueba')).toBeInTheDocument();
      expect(screen.getByText('Otro lugar')).toBeInTheDocument();
      expect(screen.getByText('25.5')).toBeInTheDocument();
      expect(screen.getByText('30.2')).toBeInTheDocument();
      expect(screen.getByText('kg')).toBeInTheDocument();
      expect(screen.getByText('m')).toBeInTheDocument();
      expect(screen.getByText('TEMP')).toBeInTheDocument();
      expect(screen.getByText('PRES')).toBeInTheDocument();
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('María García')).toBeInTheDocument();
      expect(screen.getByText('Medición de prueba')).toBeInTheDocument();
      expect(screen.getByText('Otra medición')).toBeInTheDocument();
    });

    it('debe mostrar "-" cuando no hay notas', () => {
      const medicionesSinNotas: Medicion[] = [
        {
          ...mockMediciones[0],
          notas: null,
        },
      ];

      render(
        <MedicionesTable
          mediciones={medicionesSinNotas}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          pagination={{
            page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrevious: false
          }}
          onPageChange={jest.fn()}
        />
      );

      expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });

    it('debe mostrar la inicial del nombre del autor', () => {
      const mockPagination = {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
      const mockOnPageChange = jest.fn();

      render(
        <MedicionesTable
          mediciones={mockMediciones}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('J')).toBeInTheDocument();
      expect(screen.getByText('M')).toBeInTheDocument();
    });

    it('debe renderizar tabla vacía cuando no hay mediciones', () => {
      render(
        <MedicionesTable
          mediciones={[]}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          pagination={{
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false,
          }}
          onPageChange={jest.fn()}
        />
      );

      // Verificar que los encabezados se renderizan
      expect(screen.getByText('Fecha')).toBeInTheDocument();
      expect(screen.getByText('Lugar')).toBeInTheDocument();

      // Verificar que no hay filas de datos
      expect(screen.queryByText('Lugar de prueba')).not.toBeInTheDocument();
    });
  });

  describe('estado de carga', () => {
    it('debe mostrar loader cuando loading es true', () => {
      render(
        <MedicionesTable
          mediciones={mockMediciones}
          loading={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('debe mostrar encabezados cuando loading es true', () => {
      render(
        <MedicionesTable
          mediciones={mockMediciones}
          loading={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Fecha')).toBeInTheDocument();
      expect(screen.getByText('Lugar')).toBeInTheDocument();
      expect(screen.getByText('Valor')).toBeInTheDocument();
    });

    it('no debe mostrar datos cuando loading es true', () => {
      render(
        <MedicionesTable
          mediciones={mockMediciones}
          loading={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('Lugar de prueba')).not.toBeInTheDocument();
      expect(screen.queryByText('25.5')).not.toBeInTheDocument();
    });
  });

  describe('interacciones', () => {
    it('debe llamar onEdit con la medición correcta al hacer clic en editar', () => {
      const mockPagination = {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
      const mockOnPageChange = jest.fn();

      render(
        <MedicionesTable
          mediciones={mockMediciones}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
        />
      );

      // Encontrar todos los botones de editar (hay 2 mediciones, 2 botones)
      const editButtons = screen.getAllByRole('button');
      const editButton = editButtons[0]; // Primer botón de editar

      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledWith(mockMediciones[0]);
    });

    it('debe llamar onDelete con el ID correcto al hacer clic en eliminar', () => {
      const mockPagination = {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
      const mockOnPageChange = jest.fn();

      render(
        <MedicionesTable
          mediciones={mockMediciones}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
        />
      );

      // Encontrar todos los botones
      const buttons = screen.getAllByRole('button');
      // El segundo botón es el de eliminar de la primera fila
      const deleteButton = buttons[1];

      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith(mockMediciones[0].id);
    });

    it('debe llamar onEdit con la segunda medición al hacer clic en su botón de editar', () => {
      const mockPagination = {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
      const mockOnPageChange = jest.fn();

      render(
        <MedicionesTable
          mediciones={mockMediciones}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      // El tercer botón es el de editar de la segunda fila
      const editButton = buttons[2];

      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockMediciones[1]);
    });

    it('debe llamar onDelete con el ID de la segunda medición al hacer clic en su botón de eliminar', () => {
      const mockPagination = {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
      const mockOnPageChange = jest.fn();

      render(
        <MedicionesTable
          mediciones={mockMediciones}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      // El cuarto botón es el de eliminar de la segunda fila
      const deleteButton = buttons[3];

      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith(mockMediciones[1].id);
    });

    it('no debe llamar callbacks cuando loading es true', () => {
      render(
        <MedicionesTable
          mediciones={mockMediciones}
          loading={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // No debería haber botones de acción cuando está cargando
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBe(0);

      expect(mockOnEdit).not.toHaveBeenCalled();
      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  describe('formato de datos', () => {
    it('debe mostrar la fecha formateada', () => {
      const mockPagination = {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
      const mockOnPageChange = jest.fn();

      render(
        <MedicionesTable
          mediciones={mockMediciones}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
        />
      );

      // La fecha debe estar formateada como localeDateString
      const formattedDate = new Date('2024-01-15').toLocaleDateString();
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });

    it('debe mostrar el valor con la unidad', () => {
      const mockPagination = {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
      const mockOnPageChange = jest.fn();

      render(
        <MedicionesTable
          mediciones={mockMediciones}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
        />
      );

      // El valor y la unidad deben estar en el mismo elemento
      const valorElement = screen.getByText('25.5');
      expect(valorElement).toBeInTheDocument();
      expect(screen.getByText('kg')).toBeInTheDocument();
    });

    it('debe mostrar el código del tipo en un badge', () => {
      const mockPagination = {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
      const mockOnPageChange = jest.fn();

      render(
        <MedicionesTable
          mediciones={mockMediciones}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('TEMP')).toBeInTheDocument();
      expect(screen.getByText('PRES')).toBeInTheDocument();
    });
  });
});
