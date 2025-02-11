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
    return text.toLowerCase().replace(/(^\s*\w|[.!?¿¡]\s*\w)/g, match => match.toUpperCase());
  },

  // Divide el texto por uno o varios delimitadores
  splitByDelimiter: (text, delimiters = [';', '/', ' - ', ' – ', ' * ', '•', ',', '.'] ) => { // La coma y el punto van al final porque pueden ser parte del texto sin tener que dividirlo
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
    if (lastPart.includes(' y ') || lastPart.includes(' & ') || lastPart.includes(' and ')) {
      const newParts = lastPart.split(/ y | & | and /).map(item => item.trim()).filter(item => item !== '');
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

  
  // INICIO representación de personas

  // Filtro para eliminar títulos o grados de las personas
  removeTitles: (text) => {
    return text.replace(/\b(Dr\.|Dra\.|Prof\.|Bec\.|Lic\.|Ing\.|Mg\.|Mag\.|Sc\.|Soc\.|Arq\.)\s*/g, '');
  },

  // Filtro para eliminar referencias asociadas de las personas
  removeReferences: (text) => {
    return text.replace(/(\d+|\*+|\([a-zA-Z0-9]+\)|(?<![\p{L}])[a-z](?![\p{L}]))/gu, ''); // Elimina números, asteriscos, paréntesis con letras o números y letras (minúsculas) sueltas
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
    // AGREGAR otros filtros. EJ: espaciado doble
    return text;
  },

  transformPersons: (text) => {
    let persons = filterTransformer.splitByDelimiter(text);
    persons = persons.map(element => {
      element = filterTransformer.transformPerson(element);
      return element;
    }).filter(element => element !== ''); // Filtrar elementos vacíos
    return persons;
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
