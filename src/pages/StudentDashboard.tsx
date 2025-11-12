import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Plus, AlertCircle } from "lucide-react";

interface Complaint {
  id: string;
  title: string;
  complaint_type: string;
  description: string;
  status: string;
  admin_remark: string | null;
  date_submitted: string;
  last_updated: string;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    complaint_type: "Academic" | "Facility" | "Hostel" | "Transportation" | "Other" | "";
    description: string;
  }>({
    title: "",
    complaint_type: "",
    description: "",
  });

  useEffect(() => {
    checkAuth();
    fetchComplaints();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/student-auth");
      return;
    }

    const { data: studentData } = await supabase
      .from("students")
      .select("*")
      .eq("id", user.id)
      .single();

    setStudent(studentData);
  };

  const fetchComplaints = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("student_id", user.id)
      .order("date_submitted", { ascending: false });

    if (error) {
      toast.error("Failed to fetch complaints");
      return;
    }

    setComplaints(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("complaints").insert({
        student_id: user.id,
        title: form.title,
        complaint_type: form.complaint_type as "Academic" | "Facility" | "Hostel" | "Transportation" | "Other",
        description: form.description,
      });

      if (error) throw error;

      toast.success("Complaint submitted successfully!");
      setForm({ title: "", complaint_type: "", description: "" });
      setShowForm(false);
      fetchComplaints();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit complaint");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Pending: "bg-pending text-accent-foreground",
      "In Progress": "bg-in-progress text-primary-foreground",
      Resolved: "bg-resolved text-secondary-foreground",
    };

    return (
      <Badge className={variants[status] || ""}>{status}</Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
            {student && <p className="text-sm text-muted-foreground">{student.name} • {student.reg_no}</p>}
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">My Complaints</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            New Complaint
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6 shadow-md">
            <CardHeader>
              <CardTitle>Submit New Complaint</CardTitle>
              <CardDescription>Fill in the details below to submit your complaint</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief summary of your complaint"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Complaint Type</Label>
                  <Select
                    value={form.complaint_type}
                    onValueChange={(value) => setForm({ ...form, complaint_type: value as "Academic" | "Facility" | "Hostel" | "Transportation" | "Other" })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Facility">Facility</SelectItem>
                      <SelectItem value="Hostel">Hostel</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about your complaint"
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit Complaint"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {complaints.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No complaints submitted yet. Click "New Complaint" to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            complaints.map((complaint) => (
              <Card key={complaint.id} className="shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{complaint.title}</CardTitle>
                      <CardDescription>
                        {complaint.complaint_type} • Submitted on{" "}
                        {new Date(complaint.date_submitted).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(complaint.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{complaint.description}</p>
                  {complaint.admin_remark && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium mb-1">Admin Response:</p>
                      <p className="text-sm text-muted-foreground">{complaint.admin_remark}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
