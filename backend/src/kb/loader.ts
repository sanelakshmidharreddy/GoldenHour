import fs from 'fs';
import path from 'path';
import {
  KnowledgeBaseData,
  KnowledgeBaseLoadResult,
  FraudPlaybook,
} from './types';

function safeReadJsonFile<T>(filePath: string, warnings: string[]): T | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const rawContent = fs.readFileSync(filePath, 'utf-8').trim();
    if (!rawContent) {
      warnings.push(`File ${path.basename(filePath)} is empty.`);
      return {} as T;
    }
    return JSON.parse(rawContent) as T;
  } catch (err: any) {
    warnings.push(`Failed to parse JSON in ${path.basename(filePath)}: ${err.message}`);
    return null;
  }
}

/**
 * Resilient Knowledge Base Loader
 *
 * Scans the provided knowledge base directory and loads all static fact sheets and playbooks.
 * Gracefully handles missing files, parse errors, and empty `{}` placeholders.
 */
export function loadKnowledgeBase(baseDir: string): KnowledgeBaseLoadResult {
  const loadedFiles: string[] = [];
  const missingFiles: string[] = [];
  const warnings: string[] = [];

  const defaultData: KnowledgeBaseData = {
    contacts: {},
    expectations: {},
    ncrpMapping: {},
    sources: {},
    kbMeta: {},
    playbooks: {},
  };

  if (!baseDir || !fs.existsSync(baseDir)) {
    warnings.push(`Knowledge base directory does not exist at: ${baseDir}`);
    return {
      data: defaultData,
      isLoaded: false,
      baseDir: baseDir || '',
      loadedFiles,
      missingFiles,
      warnings,
    };
  }

  // Load top-level JSON files
  const topLevelFiles: Array<{ key: keyof Omit<KnowledgeBaseData, 'playbooks'>; filename: string }> = [
    { key: 'contacts', filename: 'contacts.json' },
    { key: 'expectations', filename: 'expectations.json' },
    { key: 'ncrpMapping', filename: 'ncrp_mapping.json' },
    { key: 'sources', filename: 'sources.json' },
    { key: 'kbMeta', filename: 'kb_meta.json' },
  ];

  for (const { key, filename } of topLevelFiles) {
    const fullPath = path.join(baseDir, filename);
    if (fs.existsSync(fullPath)) {
      const parsed = safeReadJsonFile<any>(fullPath, warnings);
      if (parsed !== null) {
        defaultData[key] = parsed;
        loadedFiles.push(filename);
      }
    } else {
      missingFiles.push(filename);
    }
  }

  // Load fraud playbooks subfolder
  const playbooksDir = path.join(baseDir, 'fraud_playbooks');
  if (fs.existsSync(playbooksDir)) {
    try {
      const playbookFiles = fs.readdirSync(playbooksDir).filter((file) => file.endsWith('.json'));
      for (const playbookFile of playbookFiles) {
        const playbookPath = path.join(playbooksDir, playbookFile);
        const parsed = safeReadJsonFile<FraudPlaybook>(playbookPath, warnings);
        if (parsed !== null) {
          const playbookId = path.basename(playbookFile, '.json');
          defaultData.playbooks[playbookId] = parsed;
          loadedFiles.push(`fraud_playbooks/${playbookFile}`);
        }
      }
    } catch (err: any) {
      warnings.push(`Error reading fraud_playbooks directory: ${err.message}`);
    }
  } else {
    missingFiles.push('fraud_playbooks/');
  }

  return {
    data: defaultData,
    isLoaded: loadedFiles.length > 0,
    baseDir,
    loadedFiles,
    missingFiles,
    warnings,
  };
}
