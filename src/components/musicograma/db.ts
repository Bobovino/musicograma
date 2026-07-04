import type { ProjectRecord } from './types';

const DB_NAME = 'musicograma_db';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

// Cached as a single in-flight/resolved promise so concurrent callers share one
// connection instead of racing to open separate ones, and so we don't leak a
// new connection per save/load call.
let dbPromise: Promise<IDBDatabase> | null = null;

function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

function openDB(): Promise<IDBDatabase> {
  if (!isIndexedDBAvailable()) {
    return Promise.reject(new Error('IndexedDB no está disponible en este navegador'));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'projectName' });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      // If the DB is upgraded from another tab, drop our cached connection
      // so the next call reopens a fresh one instead of using a closed handle.
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    req.onerror = () => {
      dbPromise = null;
      reject(req.error ?? new Error('No se pudo abrir la base de datos'));
    };
    req.onblocked = () => {
      dbPromise = null;
      reject(new Error('La base de datos está bloqueada por otra pestaña'));
    };
  });

  return dbPromise;
}

export async function dbSaveProject(record: ProjectRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Error al guardar el proyecto'));
    tx.onabort = () => reject(tx.error ?? new Error('Guardado cancelado'));
  });
}

export async function dbLoadProject(projectName: string): Promise<ProjectRecord | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(projectName);
    req.onsuccess = () => resolve((req.result as ProjectRecord | undefined) ?? null);
    req.onerror = () => reject(req.error ?? new Error('Error al cargar el proyecto'));
  });
}

export async function dbListProjects(): Promise<string[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAllKeys();
    req.onsuccess = () => resolve((req.result as string[]) ?? []);
    req.onerror = () => reject(req.error ?? new Error('Error al listar proyectos'));
  });
}

export async function dbDeleteProject(projectName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(projectName);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Error al borrar el proyecto'));
  });
}
