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
      vendors: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          vendor_id: string
          role: 'owner' | 'staff' | 'viewer'
          created_at: string
        }
        Insert: {
          id: string
          vendor_id: string
          role: 'owner' | 'staff' | 'viewer'
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          role?: 'owner' | 'staff' | 'viewer'
          created_at?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          id: string
          vendor_id: string
          name: string
          description: string | null
          category: string
          cost_price: number
          selling_price: number
          total_quantity: number
          available_quantity: number
          unit: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          name: string
          description?: string | null
          category: string
          cost_price?: number
          selling_price?: number
          total_quantity?: number
          available_quantity?: number
          unit?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          name?: string
          description?: string | null
          category?: string
          cost_price?: number
          selling_price?: number
          total_quantity?: number
          available_quantity?: number
          unit?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock_entries: {
        Row: {
          id: string
          vendor_id: string
          item_id: string
          quantity_added: number
          cost_per_unit: number
          total_cost: number
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          item_id: string
          quantity_added: number
          cost_per_unit: number
          total_cost?: number
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          item_id?: string
          quantity_added?: number
          cost_per_unit?: number
          total_cost?: number
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_entries_item_id_fkey"
            columns: ["item_id"]
            referencedRelation: "items"
            referencedColumns: ["id"]
          }
        ]
      }
      customers: {
        Row: {
          id: string
          vendor_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage: {
        Row: {
          id: string
          vendor_id: string
          item_id: string
          customer_id: string
          quantity_used: number
          event_name: string | null
          event_date: string | null
          is_returned: boolean
          created_by: string
          created_at: string
          returned_at: string | null
          expected_return_date: string | null
        }
        Insert: {
          id?: string
          vendor_id: string
          item_id: string
          customer_id: string
          quantity_used: number
          event_name?: string | null
          event_date?: string | null
          is_returned?: boolean
          created_by: string
          created_at?: string
          returned_at?: string | null
          expected_return_date?: string | null
        }
        Update: {
          id?: string
          vendor_id?: string
          item_id?: string
          customer_id?: string
          quantity_used?: number
          event_name?: string | null
          event_date?: string | null
          is_returned?: boolean
          created_by?: string
          created_at?: string
          returned_at?: string | null
          expected_return_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_item_id_fkey"
            columns: ["item_id"]
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      sales: {
        Row: {
          id: string
          vendor_id: string
          customer_id: string
          total_amount: number
          discount: number
          final_amount: number
          items_cost: number
          profit: number
          payment_status: 'paid' | 'pending' | 'partial'
          payment_method: string | null
          invoice_number: string | null
          notes: string | null
          created_at: string
          date: string
        }
        Insert: {
          id?: string
          vendor_id: string
          customer_id: string
          total_amount?: number
          discount?: number
          final_amount?: number
          items_cost?: number
          profit?: number
          payment_status?: 'paid' | 'pending' | 'partial'
          payment_method?: string | null
          invoice_number?: string | null
          notes?: string | null
          created_at?: string
          date?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          customer_id?: string
          total_amount?: number
          discount?: number
          final_amount?: number
          items_cost?: number
          profit?: number
          payment_status?: 'paid' | 'pending' | 'partial'
          payment_method?: string | null
          invoice_number?: string | null
          notes?: string | null
          created_at?: string
          date?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      item_images: {
        Row: {
          id: string
          vendor_id: string
          item_id: string
          url: string
          path: string
          file_name: string
          file_size: number | null
          mime_type: string | null
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          item_id: string
          url: string
          path: string
          file_name: string
          file_size?: number | null
          mime_type?: string | null
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          item_id?: string
          url?: string
          path?: string
          file_name?: string
          file_size?: number | null
          mime_type?: string | null
          is_primary?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_images_item_id_fkey"
            columns: ["item_id"]
            referencedRelation: "items"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
