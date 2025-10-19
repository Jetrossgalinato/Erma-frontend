// Type definitions
export type Equipment = {
  id: number;
  po_number?: string;
  unit_number?: string;
  brand_name?: string;
  description?: string;
  category?: string;
  status?: string;
  date_acquired?: string;
  supplier?: string;
  amount?: string;
  estimated_life?: string;
  item_number?: string;
  property_number?: string;
  control_number?: string;
  serial_number?: string;
  person_liable?: string;
  remarks?: string;
  updated_at?: string;
  name: string;
  facility_id?: number;
  availability?: string;
  created_at: string;
  image?: string;
};

export type Facility = {
  id: number;
  name: string;
};

// Image validation and processing helpers
export const validateImageFile = (file: File): string | null => {
  if (!file.type.match(/^image\/(png|jpe?g)$/i)) {
    return "Please select a PNG or JPG image file";
  }

  if (file.size > 5 * 1024 * 1024) {
    return "Image file size must be less than 5MB";
  }

  return null;
};

export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Equipment filtering helpers
export const filterEquipments = (
  equipments: Equipment[],
  categoryFilter: string,
  facilityFilter: string
): Equipment[] => {
  return equipments.filter((eq) => {
    const matchesCategory =
      !categoryFilter ||
      eq.category?.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesFacility =
      !facilityFilter || eq.facility_id === parseInt(facilityFilter);
    return matchesCategory && matchesFacility;
  });
};

export const getUniqueCategories = (equipments: Equipment[]): string[] => {
  return [
    ...new Set(equipments.map((eq) => eq.category).filter(Boolean)),
  ].sort() as string[];
};

export const calculateTotalPages = (
  totalItems: number,
  itemsPerPage: number
): number => {
  return Math.ceil(totalItems / itemsPerPage);
};

// CSV parsing helper
export const parseCSVToEquipment = async (
  file: File
): Promise<Partial<Equipment>[]> => {
  const text = await file.text();
  const lines = text.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error(
      "CSV file must have at least a header row and one data row"
    );
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  const equipmentData: Partial<Equipment>[] = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const equipment: Partial<Equipment> = {};

    headers.forEach((header, index) => {
      const value = values[index] || "";

      switch (header.toLowerCase()) {
        case "name":
        case "equipment name":
          equipment.name = value;
          break;
        case "po number":
        case "po_number":
        case "ponumber":
          equipment.po_number = value;
          break;
        case "unit number":
        case "unit_number":
        case "unitnumber":
          equipment.unit_number = value;
          break;
        case "brand name":
        case "brand_name":
        case "brand":
          equipment.brand_name = value;
          break;
        case "description":
          equipment.description = value;
          break;
        case "category":
          equipment.category = value;
          break;
        case "status":
          equipment.status = value;
          break;
        case "availability":
          equipment.availability = value;
          break;
        case "date acquired":
        case "date_acquired":
        case "dateacquired":
          equipment.date_acquired = value;
          break;
        case "supplier":
          equipment.supplier = value;
          break;
        case "amount":
        case "price":
          equipment.amount = value;
          break;
        case "estimated life":
        case "estimated_life":
        case "estimatedlife":
          equipment.estimated_life = value;
          break;
        case "item number":
        case "item_number":
        case "itemnumber":
          equipment.item_number = value;
          break;
        case "property number":
        case "property_number":
        case "propertynumber":
          equipment.property_number = value;
          break;
        case "control number":
        case "control_number":
        case "controlnumber":
          equipment.control_number = value;
          break;
        case "serial number":
        case "serial_number":
        case "serialnumber":
          equipment.serial_number = value;
          break;
        case "person liable":
        case "person_liable":
        case "personliable":
          equipment.person_liable = value;
          break;
        case "facility id":
        case "facility_id":
        case "facilityid":
          equipment.facility_id = value ? parseInt(value, 10) : undefined;
          break;
        case "remarks":
        case "notes":
          equipment.remarks = value;
          break;
      }
    });

    return equipment;
  });

  return equipmentData;
};

// Validation helpers
export const validateEquipmentName = (name?: string): boolean => {
  return !!name && name.trim().length > 0;
};

export const validateCSVFile = (file: File): string | null => {
  if (!file.name.endsWith(".csv")) {
    return "Please select a CSV file";
  }
  return null;
};
