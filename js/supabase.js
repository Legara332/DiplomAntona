import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://bouylsgkvlsrotxhnpit.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdXlsc2drdmxzcm90eGhucGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwOTUwMjYsImV4cCI6MjA1ODY3MTAyNn0.hQfHzUj4Y3LqL9S9q1etJnhiDQkIvEKIQlyOdOyPWJE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function saveOrder(orderData) {
    const { data, error } = await supabase
        .from('orders')
        .insert([{
            customer_name: orderData.customer_name,
            customer_phone: orderData.customer_phone,
            total: orderData.total,
            items: orderData.items,
            status: 'new',
            created_at: new Date().toISOString()
        }])
        .select()

    if (error) throw error
    return data
}