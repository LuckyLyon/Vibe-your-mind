export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          role: 'Viber' | 'Admin' | 'Guest'
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          role?: 'Viber' | 'Admin' | 'Guest'
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          role?: 'Viber' | 'Admin' | 'Guest'
          bio?: string | null
          updated_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          title: string
          description: string | null
          author_id: string
          tags: string[]
          likes: number
          has_prototype: boolean
          demo_url: string | null
          status: 'concept' | 'in-progress' | 'live'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          author_id: string
          tags?: string[]
          likes?: number
          has_prototype?: boolean
          demo_url?: string | null
          status?: 'concept' | 'in-progress' | 'live'
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          tags?: string[]
          has_prototype?: boolean
          demo_url?: string | null
          status?: 'concept' | 'in-progress' | 'live'
          updated_at?: string
        }
      }
      idea_collaborators: {
        Row: {
          idea_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          idea_id: string
          user_id: string
          joined_at?: string
        }
        Update: {}
      }
      comments: {
        Row: {
          id: string
          idea_id: string
          author_id: string
          parent_id: string | null
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          author_id: string
          parent_id?: string | null
          content: string
          created_at?: string
        }
        Update: {
          content?: string
        }
      }
      likes: {
        Row: {
          user_id: string
          idea_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          idea_id: string
          created_at?: string
        }
        Update: {}
      }
      channels: {
        Row: {
          id: string
          name: string
          type: 'public' | 'group' | 'dm' | 'ai'
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'public' | 'group' | 'dm' | 'ai'
          description?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          channel_id: string
          sender_id: string | null
          sender_name: string
          content: string
          is_bot: boolean
          is_system: boolean
          created_at: string
        }
        Insert: {
          id?: string
          channel_id: string
          sender_id?: string | null
          sender_name: string
          content: string
          is_bot?: boolean
          is_system?: boolean
          created_at?: string
        }
        Update: {}
      }
      bounties: {
        Row: {
          id: string
          title: string
          type: 'Coding' | 'Design' | 'Marketing' | 'Coffee Chat'
          reward: string
          requester_id: string
          description: string | null
          location: string
          status: 'Open' | 'Closed'
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          type: 'Coding' | 'Design' | 'Marketing' | 'Coffee Chat'
          reward: string
          requester_id: string
          description?: string | null
          location?: string
          status?: 'Open' | 'Closed'
          created_at?: string
        }
        Update: {
          title?: string
          reward?: string
          description?: string | null
          location?: string
          status?: 'Open' | 'Closed'
        }
      }
      vinyls: {
        Row: {
          id: string
          title: string
          artist_id: string
          mood: string | null
          bpm: number | null
          genre: 'Frontend' | 'Backend' | 'Architecture' | 'Creative' | null
          prompt_content: string
          price: string
          cover_color: string
          copy_count: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          artist_id: string
          mood?: string | null
          bpm?: number | null
          genre?: 'Frontend' | 'Backend' | 'Architecture' | 'Creative' | null
          prompt_content: string
          price?: string
          cover_color?: string
          copy_count?: number
          created_at?: string
        }
        Update: {
          title?: string
          mood?: string | null
          bpm?: number | null
          genre?: 'Frontend' | 'Backend' | 'Architecture' | 'Creative' | null
          prompt_content?: string
          price?: string
          cover_color?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          url: string
          author_id: string
          tags: string[]
          likes: number
          featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          url: string
          author_id: string
          tags?: string[]
          likes?: number
          featured?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          image_url?: string | null
          url?: string
          tags?: string[]
          featured?: boolean
        }
      }
      project_likes: {
        Row: {
          user_id: string
          project_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          project_id: string
          created_at?: string
        }
        Update: {}
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
