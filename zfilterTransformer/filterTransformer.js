// filterTransformer.js
export const filterTransformer = {
  // Convierte el texto a camelCase
  toCamelCase: (text) => {
    return text
      .toLowerCase()
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '');
  },

  // Convierte el texto a mayúsculas
  toUpperCase: (text) => {
    return text.toUpperCase();
  },

  // Convierte el texto a minúsculas
  toLowerCase: (text) => {
    return text.toLowerCase();
  },

  // Convierte la primera letra de cada oración a mayúsculas (COMPLEMENTAR CON NER PARA EL TEMA NOMBRES PROPIOS)
  toCapitalize(text) {
    return text.toLowerCase().replace(/(^\s*[\p{L}]|[.!?¿¡]\s*[\p{L}])/gu, match => match.toUpperCase());
  },

  // Divide el texto por uno o varios delimitadores
  splitByDelimiter: (text, delimiters = [';', '/', ' - ', ' – ', ' * ', '•', '●', ',', '.'] ) => { // La coma y el punto van al final porque pueden ser parte del texto sin tener que dividirlo
    // Manejar el caso específico de dividir por el guión '-' y el guión largo '–'
    if (text.includes('-') && text.includes('–')) {
      const parts = text.split(/-|–/).map(item => item.trim()).filter(item => item !== '');
      return parts;
    }
    
    let parts = [text];
    for (const delimiter of delimiters) {
      const escapedDelimiter = delimiter.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // Escapar caracteres especiales en el delimitador
      const regex = new RegExp(escapedDelimiter, 'g');
      const newParts = parts.flatMap(part => part.split(regex).map(item => item.trim()).filter(item => item !== ''));
      if (newParts.length > 1) {
        parts = newParts;
        break; // Detener el bucle si se ha realizado una división exitosa
      }
    }

    // VER CASO PALABRAS CLAVES 'mito; leer; historia; teseo y el minotauro'
    // Verificar si la última parte contiene ' y ', ' & ' o ' and '
    const lastPart = parts[parts.length - 1];
    if (lastPart.includes(' y ') || 
        lastPart.includes(' & ') || 
        lastPart.includes(' and ') ||
        lastPart.match(/^and\s/) ||
        lastPart.match(/^&\s/) ||
        lastPart.match(/\s&\s/) ||
        lastPart.match(/\sand\s/)) {
      
      // Usar una expresión regular más completa para el split
      const newParts = lastPart.split(/\s*(?:\s+y\s+|\s+&\s+|\s+and\s+|^and\s+|^&\s+)\s*/)
        .map(item => item.trim())
        .filter(item => item !== '');
      
      parts.pop(); // Eliminar la última parte
      parts = parts.concat(newParts);
    }
    return parts;
  },


  // INICIO gestión de espacios y saltos de línea

  // Elimina los espacios dobles
  removeDoubleSpaces: (text) => {
    return text.replace(/\s{2,}/g, ' ');
  },

  // Sacar espacios de donde no van (letras separadas por un espacio)
  removeSpacesBetweenLetters: (text) => {
    return text.replace(/\s+/g, '');
  },

  // Elimina los espacios al principio y al final del texto
  removeSpacesAtStartAndEnd: (text) => {
    return text.trim();
  },

  // Elimina los saltos de línea
  removeLineBreaks: (text) => {
    return text.replace(/(\r\n|\n|\r)/gm, '');
  },

  // FIN gestión de espacios y saltos de línea


  // Limpieza general del texto
  cleanText: (text) => {
    let cleanText = filterTransformer.removeSpacesAtStartAndEnd(text);
    cleanText = filterTransformer.removeDoubleSpaces(cleanText);

    // Limpiar comas consecutivas que puedan haber quedado después de remover referencias
    cleanText = cleanText.replace(/,+/g, ','); // Reemplazar múltiples comas por una sola
    cleanText = cleanText.replace(/,\s*$/, ''); // Remover coma al final
    cleanText = cleanText.replace(/^\s*,/, ''); // Remover coma al inicio

    // Acomodar espacios alrededor de guiones y guiones largos
    cleanText = cleanText
    .replace(/(\s)-(?!\s)/g, '$1- ') // Caso: espacio antes pero no después (Palabra -clave → Palabra - clave)
    .replace(/(?<!\s)-(\s)/g, ' -$1') // Caso: espacio después pero no antes (Palabra- clave → Palabra - clave)
    .replace(/(\s)–(?!\s)/g, '$1– ') // Caso: espacio antes pero no después (Palabra –clave → Palabra – clave)
    .replace(/(?<!\s)–(\s)/g, ' –$1'); // Caso: espacio después pero no antes (Palabra– clave → Palabra – clave)

    cleanText = cleanText.trim();
    return cleanText;
  },

  
  // INICIO representación de personas

  // Detecta si el texto contiene una sola persona o múltiples
  isSinglePerson: (text) => {
    // Limpiar el texto primero
    let cleanText = text.trim();
    
    // Caso 1: Verificar si hay conectores claros de múltiples autores
    const multipleAuthorConnectors = [' y ', ' & ', ' and ', ';'];
    for (const connector of multipleAuthorConnectors) {
      if (cleanText.includes(connector)) {
        return false; // Múltiples autores
      }
    }
    
    // Caso 2: Contar comas - si hay más de una coma, probablemente sean múltiples autores
    const commaCount = (cleanText.match(/,/g) || []).length;
    if (commaCount > 1) {
      return false; // Múltiples autores
    }
    
    // Caso 3: Si hay exactamente una coma, verificar si es formato "Apellido, Nombre"
    if (commaCount === 1) {
      const parts = cleanText.split(',');
      if (parts.length === 2) {
        const beforeComma = parts[0].trim();
        const afterComma = parts[1].trim();
        
        // Verificar que ambas partes tengan contenido y no sean muy largas
        // (nombres/apellidos típicamente no superan 3-4 palabras cada uno)
        const beforeWords = beforeComma.split(/\s+/).length;
        const afterWords = afterComma.split(/\s+/).length;
        
        if (beforeWords <= 4 && afterWords <= 4 && beforeComma.length > 0 && afterComma.length > 0) {
          return true; // Es formato "Apellido, Nombre" - una sola persona
        }
      }
    }
    
    // Caso 4: Sin comas - verificar si parece ser una sola persona
    if (commaCount === 0) {
      const words = cleanText.split(/\s+/);
      // Si tiene entre 1 y 5 palabras, probablemente sea una sola persona
      // (Nombre, Segundo Nombre, Apellido Paterno, Apellido Materno, inicial)
      if (words.length >= 1 && words.length <= 5) {
        return true;
      }
    }
    
    return false; // Por defecto, asumir múltiples si no se puede determinar
  },

  // Filtro para eliminar títulos o grados de las personas
  removeTitles: (text) => {
    return text.replace(/\b(Dr\.|Dra\.|Prof\.|Bec\.|Lic\.|Ing\.|Mg\.|Mag\.|Sc\.|Soc\.|Arq\.|Esp\.)\s*/gi, '');
  },

  // Filtro para eliminar referencias asociadas de las personas
  removeReferences: (text) => {
    return text.replace(/(\d+|\*+|\([a-zA-Z0-9]+\)|(?<![\p{L}])[a-xz](?![\p{L}]))/gu, ''); // Elimina números, asteriscos, paréntesis con letras o números y letras (minúsculas) sueltas excepto 'y'
  },

  // Método para reodenar Nombre Apellido en Apellido, Nombre (SOLO SIRVE CON UNO DE CADA UNO)
  reorderPerson: (text) => {
    const words = text.trim().split(/\s+/);
    if (words.length === 2) {
      return `${words[1]}, ${words[0]}`;
    }
    return false;
  },

  // FIN representación de personas


  // INICIO acceso rápido personas
  transformPerson: (text) => {
    text = filterTransformer.removeTitles(text);
    text = filterTransformer.removeReferences(text);
    text = filterTransformer.cleanText(text);
    return text;
  },

  transformPersons: (text) => {
    text = filterTransformer.transformPerson(text);
    if (filterTransformer.isSinglePerson(text)) {
      const reordered = filterTransformer.reorderPerson(text);
      const person = reordered !== false ? reordered : text;
      return [person];
    } else {
      let persons = filterTransformer.splitByDelimiter(text);
      persons = persons.map(person => {
        const reordered = filterTransformer.reorderPerson(person);
        person = reordered !== false ? reordered : person;
        return person;
      });
      return persons;
    }
  },
  // FIN acceso rápido personas


  // INICIO acceso rápido palabras claves
  transformKeyword: (text) => {
    // AGREGAR otros filtros. EJ: espaciado doble
    return text;
  },

  transformKeywords: (text) => {
    let keywords = filterTransformer.splitByDelimiter(text);
    keywords = keywords.map(element => {
      element = filterTransformer.transformKeyword(element);
      return element;
    }).filter(element => element !== ''); // Filtrar elementos vacíos
    return keywords;
  },
  // FIN acceso rápido palabras claves
};
