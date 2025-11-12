-- Create enum for complaint status
CREATE TYPE public.complaint_status AS ENUM ('Pending', 'In Progress', 'Resolved');

-- Create enum for complaint type
CREATE TYPE public.complaint_type AS ENUM ('Academic', 'Facility', 'Hostel', 'Transportation', 'Other');

-- Create enum for admin role
CREATE TYPE public.admin_role AS ENUM ('Super Admin', 'Department Admin');

-- Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  reg_no VARCHAR(20) UNIQUE NOT NULL,
  department VARCHAR(50) NOT NULL,
  semester VARCHAR(10) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create admins table
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role admin_role NOT NULL DEFAULT 'Department Admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  complaint_type complaint_type NOT NULL,
  description TEXT NOT NULL,
  status complaint_status NOT NULL DEFAULT 'Pending',
  admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
  admin_remark TEXT,
  attachment VARCHAR(255),
  date_submitted TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students
CREATE POLICY "Students can view their own profile"
  ON public.students FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Students can update their own profile"
  ON public.students FOR UPDATE
  USING (id = auth.uid());

-- RLS Policies for admins
CREATE POLICY "Admins can view all admin profiles"
  ON public.admins FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.admins));

-- RLS Policies for complaints
CREATE POLICY "Students can view their own complaints"
  ON public.complaints FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can create complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can view all complaints"
  ON public.complaints FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.admins));

CREATE POLICY "Admins can update all complaints"
  ON public.complaints FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.admins));

-- Create function to update last_updated timestamp
CREATE OR REPLACE FUNCTION public.update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for complaints table
CREATE TRIGGER update_complaints_last_updated
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_updated();

-- Enable realtime for complaints
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;