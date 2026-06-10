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
    // Verificar si la última parte contiene ' y ', ' Y ', ' & ' o ' and '
    const lastPart = parts[parts.length - 1];
    if (lastPart.includes(' y ') || 
        lastPart.includes(' Y ') || 
        lastPart.includes(' & ') || 
        lastPart.includes(' and ') ||
        lastPart.match(/^and\s/) ||
        lastPart.match(/^&\s/) ||
        lastPart.match(/\s&\s/) ||
        lastPart.match(/\sand\s/)) {
      
      // Usar una expresión regular más completa para el split
      const newParts = lastPart.split(/\s*(?:\s+y\s+|\s+Y\s+|\s+&\s+|\s+and\s+|^and\s+|^&\s+)\s*/)
        .map(item => item.trim())
        .filter(item => item !== '');
      
      parts.pop(); // Eliminar la última parte
      parts = parts.concat(newParts);
    }
    
    // Valido la cantidad de partes para no exceder el límite de elementos en pantalla
    if (parts.length > 20) {
      alert(`Se detectaron ${parts.length} elementos después de dividir el texto. Solo se procesarán los primeros 20.`);
      parts = parts.slice(0, 20);
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
    // Primero eliminar guiones de división de palabras al final de línea
    text = text.replace(/\s*-\s*(\r\n|\n|\r)\s*/g, ''); // Guión + salto de línea = unir palabras
    
    // Luego eliminar saltos de línea normales
    text = text.replace(/(\r\n|\n|\r)/gm, ' '); // Reemplazar por espacio para mantener separación entre palabras
    
    // Limpiar espacios dobles que puedan haber quedado
    text = text.replace(/\s{2,}/g, ' ');
    
    return text;
  },

  // FIN gestión de espacios y saltos de línea


  unescapeSlashes(text) {
    return text.replace(/\\([\\"'0])/g, '$1');
  },

  escapeHtml(text, escapeQuotes, escapeLessThanAndGreaterThan) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    let pattern;
    
    if (escapeQuotes && escapeLessThanAndGreaterThan) {
      // Escapar todo: &, <, >, ", '
      pattern = /[&<>"']/g;
    } else if (escapeQuotes && !escapeLessThanAndGreaterThan) {
      // Escapar solo &, ", '
      pattern = /[&"']/g;
    } else if (!escapeQuotes && escapeLessThanAndGreaterThan) {
      // Escapar solo &, <, >
      pattern = /[&<>]/g;
    } else {
      // Escapar solo &
      pattern = /[&]/g;
    }
  
    return text.replace(pattern, (char) => map[char]);
  },

  specialHtmlEntities(str) {
    const f = 0xffff;
    const convmap = [
      // <!ENTITY % HTMLlat1 PUBLIC "-//W3C//ENTITIES Latin 1//EN//HTML">
      // 38, 38, 0, f,  60, 60, 0, f,  62, 62, 0, f,  // SE RESUELVE EN EL MÉTODO escapeHtml
      // 160, 255, 0, f,                              // YA ESTABA COMENTADO EN SEDICI5
      // <!ENTITY % HTMLsymbol PUBLIC "-//W3C//ENTITIES Symbols//EN//HTML">
      402, 402, 0, f,  913, 929, 0, f,  931, 937, 0, f,
      945, 969, 0, f,  977, 978, 0, f,  982, 982, 0, f,
      8226, 8226, 0, f, 8230, 8230, 0, f, 8242, 8243, 0, f,
      8254, 8254, 0, f, 8260, 8260, 0, f, 8465, 8465, 0, f,
      8472, 8472, 0, f, 8476, 8476, 0, f, 8482, 8482, 0, f,
      8501, 8501, 0, f, 8592, 8596, 0, f, 8629, 8629, 0, f,
      8656, 8660, 0, f, 8704, 8704, 0, f, 8706, 8707, 0, f,
      8709, 8709, 0, f, 8711, 8713, 0, f, 8715, 8715, 0, f,
      8719, 8719, 0, f, 8721, 8722, 0, f, 8727, 8727, 0, f,
      8730, 8730, 0, f, 8733, 8734, 0, f, 8736, 8736, 0, f,
      8743, 8747, 0, f, 8756, 8756, 0, f, 8764, 8764, 0, f,
      8773, 8773, 0, f, 8776, 8776, 0, f, 8800, 8801, 0, f,
      8804, 8805, 0, f, 8834, 8836, 0, f, 8838, 8839, 0, f,
      8853, 8853, 0, f, 8855, 8855, 0, f, 8869, 8869, 0, f,
      8901, 8901, 0, f, 8968, 8971, 0, f, 9001, 9002, 0, f,
      9674, 9674, 0, f, 9824, 9824, 0, f, 9827, 9827, 0, f,
      9829, 9830, 0, f,
      // <!ENTITY % HTMLspecial PUBLIC "-//W3C//ENTITIES Special//EN//HTML">
      // These ones excluded to enable HTML: 34, 38, 60, 62
      338, 339, 0, f,  352, 353, 0, f,  376, 376, 0, f,
      710, 710, 0, f,  732, 732, 0, f, 8194, 8195, 0, f,
      8201, 8201, 0, f, 8204, 8207, 0, f, 8211, 8212, 0, f,
      8216, 8218, 0, f, 8218, 8218, 0, f, 8220, 8222, 0, f,
      8224, 8225, 0, f, 8240, 8240, 0, f, 8249, 8250, 0, f,
      8364, 8364, 0, f
    ];

    function inConvmap(code) {
      for (let i = 0; i < convmap.length; i += 4) {
        let start = convmap[i];
        let end = convmap[i + 1];
        if (code >= start && code <= end) {
          return true;
        }
      }
      return false;
    }

    let result = '';
    for (let char of str) {
      let code = char.codePointAt(0);
      if (inConvmap(code)) {
        result += `&#${code};`;
      } else {
        result += char;
      }
    }
    return result;
  },

  normalizeText(text, escapeLessThanAndGreaterThan) {
    const escapeQuotes = false;

    // 1. Deshacer escapes tipo magic_quotes
    text = filterTransformer.unescapeSlashes(text);

    // 2. Escape HTML
    text = filterTransformer.escapeHtml(text, escapeQuotes, escapeLessThanAndGreaterThan);

    // 3. Normalizar entidades HTML especiales
    text = filterTransformer.specialHtmlEntities(text);

    return text;
  },

  fixMisplacedAccents: (text) => {
    // Casos por si el texto viene de otro visualizador o fuente

    if (text.includes('´')) {
      text = text.replace(/´\s*(\n|\r\n|\r)/g, '\n'); // Acento al final de línea (no se puede saber a quién pertenece)
      text = text.replace(/\s*´\s*([aAeEiIıoOuUnN])/g, (match, vowel) => { // Acento separado por espacios de la vocal
        const map = {
          'a': 'á', 'A': 'Á',
          'e': 'é', 'E': 'É',
          'i': 'í', 'I': 'Í', 'ı': 'í',
          'o': 'ó', 'O': 'Ó',
          'u': 'ú', 'U': 'Ú',
          'n': 'ñ', 'N': 'Ñ',
        };
        return map[vowel] || vowel;
      });
      text = text.replace(/\s*´\s*([í])/g, '$1'); // Caso especial de í con acento separado por espacio
    }

    if (text.includes('˜')) {
      text = text.replace(/˜\s*(\n|\r\n|\r)/g, '\n');
      text = text.replace(/˜\s*([nN])/g, (match, letter) => {
        const map = {
          'n': 'ñ',
          'N': 'Ñ'
        };
        return map[letter] || letter;
      });
    }

    // Casos por si el texto se extrae del visualizador PDF del submission

    if (text.includes('\u0301')) {
      text = text.replace(/ ?\u0301([aAeEiIıoOuU])/g, (match, vowel) => {
        const map = {
          'a': 'á', 'A': 'Á',
          'e': 'é', 'E': 'É',
          'i': 'í', 'I': 'Í', 'ı': 'í',
          'o': 'ó', 'O': 'Ó',
          'u': 'ú', 'U': 'Ú',
        };
        return map[vowel] || vowel;
      });
    }

    if (text.includes('\u0303')) {
      text = text.replace(/ ?\u0303([nN])/g, (match, letter) => {
        const map = {
          'n': 'ñ',
          'N': 'Ñ'
        };
        return map[letter] || letter;
      });
    }

    if (text.includes('\u0327')) {
      text = text.replace(/ ?\u0327/g, 'ü');
    }

    return text;
  },

  // Limpieza general del texto
  cleanText: (text, selectedMetadataField = '') => {
    let cleanText = filterTransformer.removeSpacesAtStartAndEnd(text);
    cleanText = filterTransformer.removeDoubleSpaces(cleanText);
    cleanText = filterTransformer.removeLineBreaks(cleanText);

    // Acomodar acentos mal puestos
    cleanText = filterTransformer.fixMisplacedAccents(cleanText);

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

    const escapeLessThanAndGreaterThan = ((selectedMetadataField !== 'dc_title') && (selectedMetadataField !== 'dc_description_abstract') && (selectedMetadataField !== 'dc_description_note')) ? true : false;
    if (selectedMetadataField && selectedMetadataField !== 'dc_subject' && selectedMetadataField !== 'sedici_creator_person') {
      cleanText = filterTransformer.normalizeText(cleanText, escapeLessThanAndGreaterThan);
    }
    
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

  // Método para reodenar "Nombre/s Apellido/s" en "Apellido/s, Nombre/s"
  reorderPerson: (text) => {
    if (!text.includes(',')) { // Si tiene coma se asume que está en el formato correcto
      const words = text.trim().split(/\s+/);
      if (words.length === 2) {
        return `${words[1]}, ${words[0]}`;
      } else if (words.length === 3) {
        return `${words[2]}, ${words[0]} ${words[1]}`; // Asume que el tercer elemento es el apellido
      } else if (words.length === 4) {
        return `${words[2]} ${words[3]}, ${words[0]} ${words[1]}`; // Asume que hay dos apellidos y dos nombres
      }
    }
    return text; // Si no se puede reordenar, devolver el texto original
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
