export interface FilterInfo {
  id: string;
  label?: string;
  icon?: string;
  description: string;
}

export class FilterConfig {
  static readonly GENERAL_METADATA_FILTER: FilterInfo[] = [
    { id: 'upperCase', label: 'AA', description: 'upperCase\nPasa el texto completo a mayúsculas' },
    { id: 'lowerCase', label: 'aa', description: 'lowerCase\nPasa el texto completo a minúsculas' },
    { id: 'capitalize', label: 'Aa', description: 'Capitalize\nPasa la primera letra de cada oración a mayúscula' },
    { id: 'removeDoubleSpaces', label: '❌␣␣', description: 'Remove double spaces\nElimina los espacios dobles' },
    { id: 'removeSpacesBetweenLetters', icon: 'fa-solid fa-bars', description: 'Remove spaces between letters\nSaca espacios de donde no van (Ej: T I T U L O)' },
    { id: 'removeSpacesAtStartAndEnd', icon: 'fa-solid fa-bars', description: 'Remove spaces at start and end\nElimina los espacios al principio y al final del texto' },
    { id: 'removeLineBreaks', icon: 'fa-solid fa-bars', description: 'Remove line breaks\nElimina los saltos de línea' }
  ];

  static readonly REPEATABLE_METADATA_FILTER: FilterInfo[] = [
    { id: 'splitByDelimiter', label: 'Split', description: 'splitByDelimiter\nSe toma el texto completo como una lista y se separa en cada uno de sus elementos' },
  ];

  static readonly PEOPLE_METADATA_FILTER: FilterInfo[] = [
    { id: 'reorderPerson', icon: 'fa-solid fa-right-left', description: 'Reorder person name\nReodena "Nombre/s Apellido/s" en "Apellido/s, Nombre/s"\nACLARACIÓN:\n*Si hay 3 palabras se toman 2 nombres y 1 apellido\n*Si hay 4 palabras se toman 2 nombres y 2 apellidos' },
    { id: 'removeTitles', label: '❌🎓', description: 'Remove titles\nElimina títulos o grados de las personas (Ej: Lic., Mg.)' },
    { id: 'removeReferences', label: '❌🔢', description: 'Remove references\nElimina referencias asociadas de las personas (Ej: números, asteriscos)' },
  ];
}