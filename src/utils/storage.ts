import { promises as fsPromises } from "fs";
import * as path from "path";

/**
 * Ensure that a folder exists
 * @param {string} folderPath folderpath
 */
export async function ensureFolder(folderPath: string) {
    const mkdir = fsPromises.mkdir;
    try {
        await mkdir(folderPath, { recursive: true });
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Ensure that a folder/file exists
 * @param {string} path folderpath
 */
export async function exists(path: string) {
    try {
        await fsPromises.access(path);
        return true;
    } catch {
        return false;
    }
}

export async function storeData(options: { data: string; folderpath: string; fileName: string }) {
    const { data, folderpath, fileName } = options;
    await ensureFolder(folderpath);
    await fsPromises.writeFile(path.join(folderpath, fileName), data, "UTF-8");
}

export async function getData(options: { folderpath: string; fileName: string }) {
    const { folderpath, fileName } = options;
    await ensureFolder(folderpath);
    const data = await fsPromises.readFile(path.join(folderpath, fileName), "UTF-8");
    return data;
}

export async function deleteIfExists(folderPath: string, fileName: string) {
    const filePath = path.join(folderPath, fileName);

    if (await exists(filePath)) {
        await fsPromises.unlink(filePath);
        return true;
    }
    return false;
}
