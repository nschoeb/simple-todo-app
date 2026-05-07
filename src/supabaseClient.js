import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://batiewwgyaiafqqkixos.supabase.co'
const supabaseKey = 'sb_publishable_BTYJJsOHVdwvgFQCE2OYrw_Mm4GMjD7'

export const supabase = createClient(supabaseUrl, supabaseKey)