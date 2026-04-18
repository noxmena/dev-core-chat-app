import { UserProfile, ChatRoom, Message, Base44Response, EntityEvent } from '../types';

const BASE_URL = 'https://menac.base44.app/api';
const API_KEY = 'b48f90e90dbc49a5a0e2a657b1778a3b';

class EntityClient<T> {
  private entityName: string;

  constructor(entityName: string) {
    this.entityName = entityName;
  }

  private async request(path: string, options: RequestInit = {}) {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'api_key': API_KEY,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  async list(sortBy: string = '-created_date', limit: number = 50): Promise<T[]> {
    return this.request(`/entities/${this.entityName}?sort_by=${sortBy}&limit=${limit}`);
  }

  async filter(query: Partial<T>, sortBy: string = '-created_date', limit: number = 200): Promise<T[]> {
    const q = JSON.stringify(query);
    return this.request(`/entities/${this.entityName}?q=${encodeURIComponent(q)}&sort_by=${sortBy}&limit=${limit}`);
  }

  async get(id: string): Promise<T> {
    return this.request(`/entities/${this.entityName}/${id}`);
  }

  async create(data: Partial<T>): Promise<T> {
    return this.request(`/entities/${this.entityName}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.request(`/entities/${this.entityName}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request(`/entities/${this.entityName}/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkCreate(data: Partial<T>[]): Promise<T[]> {
    return this.request(`/entities/${this.entityName}/bulk`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Real-time subscription placeholder (polling as production-ready fallback)
  // In a real Base44 environment, this might use WebSockets/SSE.
  subscribe(callback: (event: EntityEvent<T>) => void): () => void {
    let lastCheck = new Date().toISOString();
    const interval = setInterval(async () => {
      try {
        // Find records created since last check
        const q = JSON.stringify({
          created_date: { '$gt': lastCheck }
        });
        const newRecords = await this.request(`/entities/${this.entityName}?q=${encodeURIComponent(q)}&sort_by=created_date`);
        
        if (newRecords && newRecords.length > 0) {
          lastCheck = newRecords[newRecords.length - 1].created_date;
          newRecords.forEach((record: T & { id: string }) => {
            callback({
              type: 'create',
              id: record.id,
              data: record,
            });
          });
        }
      } catch (err) {
        console.error(`Subscription error for ${this.entityName}:`, err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }
}

class Base44Client {
  entities = {
    UserProfile: new EntityClient<UserProfile>('UserProfile'),
    ChatRoom: new EntityClient<ChatRoom>('ChatRoom'),
    Message: new EntityClient<Message>('Message'),
  };

  integrations = {
    Core: {
      UploadFile: async ({ file }: { file: File }): Promise<{ file_url: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${BASE_URL}/integrations/core/upload`, {
          method: 'POST',
          headers: {
            'api_key': API_KEY,
          },
          body: formData,
        });

        if (!response.ok) throw new Error('File upload failed');
        return response.json();
      },
      InvokeLLM: async ({ prompt, response_json_schema }: { prompt: string, response_json_schema?: any }): Promise<any> => {
        const response = await fetch(`${BASE_URL}/integrations/core/invoke-llm`, {
          method: 'POST',
          headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, response_json_schema }),
        });

        if (!response.ok) throw new Error('LLM invocation failed');
        const data = await response.json();
        return data.reply || data;
      }
    }
  };
}

export const base44 = new Base44Client();
