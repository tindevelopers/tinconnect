import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://ztldppmwixnmhldlxomo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bGRwcG13aXhubWhsZGx4b21vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ3OTk0OSwiZXhwIjoyMDcyMDU1OTQ5fQ.RgpU5W6Ud51ZDKfhh8ejLs-VAGfPodtMiEQqMonOk2Y';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  try {
    console.log('Setting up Supabase database...');
    
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Applying schema...');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error('Error executing statement:', error);
          console.error('Statement:', statement);
        }
      }
    }
    
    console.log('Database setup complete!');
    
    // Create a test tenant
    console.log('Creating test tenant...');
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: 'Demo Company',
        domain: 'demo.tinconnect.com',
        settings: {
          maxParticipants: 50,
          recordingEnabled: true,
          chatEnabled: true,
          screenShareEnabled: true
        }
      })
      .select()
      .single();
    
    if (tenantError) {
      console.error('Error creating test tenant:', tenantError);
    } else {
      console.log('Test tenant created:', tenant);
    }
    
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();
