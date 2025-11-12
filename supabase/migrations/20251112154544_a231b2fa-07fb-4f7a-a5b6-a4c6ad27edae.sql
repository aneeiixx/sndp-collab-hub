-- Add INSERT policies for students table
CREATE POLICY "Students can create their own profile"
ON public.students
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Add INSERT policies for admins table  
CREATE POLICY "Admins can create their own profile"
ON public.admins
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Create trigger function to auto-create student profile
CREATE OR REPLACE FUNCTION public.handle_new_student()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.students (id, name, reg_no, department, semester, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'reg_no', ''),
    COALESCE(NEW.raw_user_meta_data->>'department', ''),
    COALESCE(NEW.raw_user_meta_data->>'semester', ''),
    NEW.email
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$;

-- Create trigger function to auto-create admin profile
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admins (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::admin_role, 'Department Admin'::admin_role)
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$;

-- Create trigger to automatically create student profile for student signups
CREATE TRIGGER on_auth_student_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data->>'user_type' = 'student')
  EXECUTE FUNCTION public.handle_new_student();

-- Create trigger to automatically create admin profile for admin signups
CREATE TRIGGER on_auth_admin_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data->>'user_type' = 'admin')
  EXECUTE FUNCTION public.handle_new_admin();