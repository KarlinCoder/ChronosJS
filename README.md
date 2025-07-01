# Chronos - La Ultimate Librería de Manejo de Fechas en JavaScript/TypeScript

![Chronos Logo](https://via.placeholder.com/150/7289DA/FFFFFF?text=⏳)  
_(Nota: Este es un logo placeholder, recomendamos agregar un logo real para tu librería)_

[![npm version](https://badge.fury.io/js/chronos-ultimate.svg)](https://www.npmjs.com/package/chronos-ultimate)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CI/CD](https://github.com/tu-usuario/chronos/actions/workflows/main.yml/badge.svg)](https://github.com/tu-usuario/chronos/actions)
[![Coverage Status](https://coveralls.io/repos/github/tu-usuario/chronos/badge.svg?branch=main)](https://coveralls.io/github/tu-usuario/chronos?branch=main)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/chronos-ultimate)](https://bundlephobia.com/package/chronos-ultimate)

Chronos es la librería definitiva para el manejo de fechas en JavaScript/TypeScript. Diseñada para ser intuitiva, potente y con soporte completo para TypeScript, Chronos simplifica el trabajo con fechas, zonas horarias, internacionalización y operaciones complejas.

## 🚀 Características Principales

- ✅ **Manejo de fechas inmutable y type-safe**
- 🌍 **Soporte completo para zonas horarias**
- 🈴 **Internacionalización integrada**
- 🧩 **API fluida y expresiva**
- ⏱ **Precisión en cálculos temporales**
- 📦 **Ligera y sin dependencias**
- 📅 **Soporte para operaciones complejas con fechas**
- 🛠 **100% compatible con TypeScript**

## 📦 Instalación

Instala Chronos usando npm o yarn:

```bash
npm install chronos-ultimate
# o
yarn add chronos-ultimate
```

## 💡 Uso Básico

```typescript
import Chronos from "chronos-ultimate";

// Crear una fecha actual
const ahora = Chronos.now();

// Crear una fecha específica
const miCumple = new Chronos("1990-05-15");

// Manipulación
const proximaSemana = ahora.add({ days: 7 });
const ayer = ahora.subtract({ days: 1 });

// Formateo
console.log(ahora.format("DD/MM/YYYY")); // "15/11/2023"
console.log(ahora.format("dddd, MMMM D, YYYY")); // "Miércoles, Noviembre 15, 2023"

// Comparación
if (proximaSemana.isAfter(ahora)) {
  console.log("La próxima semana es después de hoy");
}

// Internacionalización
const espanol = ahora.setLocale({
  months: ["Enero", "Febrero" /*...*/],
  weekdays: ["Domingo", "Lunes" /*...*/],
});
console.log(espanol.format("MMMM")); // "Noviembre"

// Zonas horarias
const nyTime = ahora.setTimezone("America/New_York");
console.log(nyTime.format("HH:mm Z")); // "14:30 -05:00"
```

## 📚 Documentación Completa

Consulta nuestra [documentación completa](https://github.com/tu-usuario/chronos/wiki) para conocer todas las funcionalidades:

- [Creación de fechas](https://github.com/tu-usuario/chronos/wiki/Creación-de-fechas)
- [Manipulación de fechas](https://github.com/tu-usuario/chronos/wiki/Manipulación-de-fechas)
- [Formateo avanzado](https://github.com/tu-usuario/chronos/wiki/Formateo)
- [Zonas horarias](https://github.com/tu-usuario/chronos/wiki/Zonas-Horarias)
- [Internacionalización](https://github.com/tu-usuario/chronos/wiki/Internacionalización)
- [Comparaciones y validaciones](https://github.com/tu-usuario/chronos/wiki/Comparaciones)

## 🤔 ¿Por qué Chronos?

| Característica       | Chronos | Moment | Date-fns | Luxon |
| -------------------- | ------- | ------ | -------- | ----- |
| TypeScript           | ✅      | ❌     | ✅       | ✅    |
| Inmutabilidad        | ✅      | ❌     | ✅       | ✅    |
| Zonas horarias       | ✅      | ✅     | ❌       | ✅    |
| Internacionalización | ✅      | ✅     | ✅       | ✅    |
| Tamaño (min+gzip)    | 12kB    | 67kB   | 30kB\*   | 50kB  |
| API moderna          | ✅      | ❌     | ✅       | ✅    |

\*Date-fns requiere importaciones separadas para cada función

## 🛠 Ejemplos Avanzados

### Calcular edad exacta

```typescript
function calcularEdad(fechaNacimiento: Chronos): string {
  const hoy = Chronos.now();
  const años = hoy.diff(fechaNacimiento, "year");
  const ultimoCumple = fechaNacimiento.add({ years: años });
  const dias = hoy.diff(ultimoCumple, "days");

  return `${años} años y ${dias} días`;
}
```

### Generar un rango de fechas

```typescript
function generarRangoSemanal(inicio: Chronos): Chronos[] {
  return Array.from({ length: 7 }, (_, i) =>
    inicio.add({ days: i }).startOf("day")
  );
}
```

### Manejo de feriados

```typescript
const feriadosArgentina = [
  new Chronos("2023-01-01"), // Año Nuevo
  // ... otros feriados
];

function esFeriado(fecha: Chronos): boolean {
  return feriadosArgentina.some((f) => f.isSame(fecha, "day"));
}
```

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee nuestras [guías de contribución](https://github.com/tu-usuario/chronos/blob/main/CONTRIBUTING.md) para empezar.

## 📄 Licencia

Chronos es [MIT Licensed](https://github.com/tu-usuario/chronos/blob/main/LICENSE).

## 🌟 Créditos

Chronos es desarrollado y mantenido por [Tu Nombre] y [contribuidores](https://github.com/tu-usuario/chronos/graphs/contributors).

---

¿Encontraste un bug o tienes una sugerencia? [Abre un issue](https://github.com/tu-usuario/chronos/issues) en GitHub.
# ChronosJS
