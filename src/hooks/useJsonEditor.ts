/**
 * Custom hook for managing JSON SRS editing state and persistence
 */

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type { ApiSrsPayload, JsonPath, JsonValue, JsonObject } from '@/lib/srsTypes';
import { updateJsonAtPath, normalizeStoredPayload } from '@/lib/srsUtils';

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

type UseJsonEditorReturn = {
  payload: ApiSrsPayload | null;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  error: string | null;
  validating: boolean;
  autoFixing: boolean;
  handleContentEdit: (path: JsonPath, value: JsonValue) => void;
  handleDiagramEdit: (path: JsonPath, value: JsonValue) => void;
  revalidateWithBackend: () => Promise<void>;
  autoFixIssues: () => Promise<void>;
};

export function useJsonEditor(): UseJsonEditorReturn {
  const [payload, setPayload] = useState<ApiSrsPayload | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [autoFixing, setAutoFixing] = useState(false);

  // Load initial payload from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('srs-generated-v2') ?? sessionStorage.getItem('srs-generated');
      if (!raw) {
        setError('No generated SRS found. Please generate from New SRS 2 page.');
        return;
      }

      const parsed = JSON.parse(raw) as unknown;
      const normalized = normalizeStoredPayload(parsed);
      if (!normalized) {
        setError('Generated SRS payload is missing or invalid.');
        return;
      }

      setPayload(normalized);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load generated SRS payload.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-persist payload to sessionStorage
  useEffect(() => {
    if (!payload) return;
    try {
      sessionStorage.setItem('srs-generated-v2', JSON.stringify(payload));
      sessionStorage.setItem(
        'srs-generated',
        JSON.stringify({
          success: payload.success,
          content: payload.content,
          generatedContent: payload.content,
          diagrams: payload.diagrams,
          validation: payload.validation,
          validationResult: payload.validation
        })
      );
    } catch {
      // Ignore storage sync failures
    }
  }, [payload]);

  const handleContentEdit = (path: JsonPath, value: JsonValue) => {
    setPayload(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        content: updateJsonAtPath(prev.content, path, value) as JsonObject
      };
    });
  };

  const handleDiagramEdit = (path: JsonPath, value: JsonValue) => {
    setPayload(prev => {
      if (!prev || !prev.diagrams) return prev;
      return {
        ...prev,
        diagrams: updateJsonAtPath(prev.diagrams, path, value) as JsonObject
      };
    });
  };

  const revalidateWithBackend = async () => {
    if (!payload?.content) return;
    setValidating(true);
    try {
      const response = await fetch(`${backendBaseUrl}/api/srs/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: payload.content })
      });

      if (!response.ok) {
        throw new Error(`Validation failed: ${response.statusText}`);
      }

      const result = await response.json();
      setPayload(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          validation: result.validation || result
        };
      });
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setValidating(false);
    }
  };

  const autoFixIssues = async () => {
    if (!payload?.content || !payload?.validation?.issues.length) return;
    setAutoFixing(true);
    try {
      const response = await fetch(`${backendBaseUrl}/api/srs/auto-fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: payload.content,
          issues: payload.validation.issues
        })
      });

      if (!response.ok) {
        throw new Error(`Auto-fix failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update content with fixed version
      if (result.content || result.fixedContent) {
        setPayload(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            content: result.content || result.fixedContent
          };
        });
      }

      // Revalidate after fixing
      await revalidateWithBackend();
    } catch (err) {
      console.error('Auto-fix error:', err);
    } finally {
      setAutoFixing(false);
    }
  };

  return {
    payload,
    isEditing,
    setIsEditing,
    loading,
    error,
    validating,
    autoFixing,
    handleContentEdit,
    handleDiagramEdit,
    revalidateWithBackend,
    autoFixIssues
  };
}

