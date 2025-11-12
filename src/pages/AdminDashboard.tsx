import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Complaint {
  id: string;
  title: string;
  complaint_type: string;
  description: string;
  status: string;
  admin_remark: string | null;
  date_submitted: string;
  last_updated: string;
  students: {
    name: string;
    reg_no: string;
    department: string;
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<any>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [updateForm, setUpdateForm] = useState<{
    status: "Pending" | "In Progress" | "Resolved";
    admin_remark: string;
  }>({
    status: "Pending",
    admin_remark: "",
  });

  useEffect(() => {
    checkAuth();
    fetchComplaints();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/admin-auth");
      return;
    }

    const { data: adminData } = await supabase
      .from("admins")
      .select("*")
      .eq("id", user.id)
      .single();

    setAdmin(adminData);
  };

  const fetchComplaints = async () => {
    const { data, error } = await supabase
      .from("complaints")
      .select(`
        *,
        students (
          name,
          reg_no,
          department
        )
      `)
      .order("date_submitted", { ascending: false });

    if (error) {
      toast.error("Failed to fetch complaints");
      return;
    }

    setComplaints(data || []);
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("complaints")
        .update({
          status: updateForm.status,
          admin_remark: updateForm.admin_remark,
          admin_id: user.id,
        })
        .eq("id", selectedComplaint.id);

      if (error) throw error;

      toast.success("Complaint updated successfully!");
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error: any) {
      toast.error(error.message || "Failed to update complaint");
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

    return <Badge className={variants[status] || ""}>{status}</Badge>;
  };

  const openUpdateDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setUpdateForm({
      status: complaint.status as "Pending" | "In Progress" | "Resolved",
      admin_remark: complaint.admin_remark || "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            {admin && <p className="text-sm text-muted-foreground">{admin.name} • {admin.role}</p>}
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">All Complaints</h2>

        <div className="grid gap-4">
          {complaints.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No complaints available at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            complaints.map((complaint) => (
              <Card key={complaint.id} className="shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => openUpdateDialog(complaint)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{complaint.title}</CardTitle>
                      <CardDescription>
                        {complaint.students.name} ({complaint.students.reg_no}) •{" "}
                        {complaint.students.department} • {complaint.complaint_type}
                      </CardDescription>
                      <CardDescription className="text-xs mt-1">
                        Submitted: {new Date(complaint.date_submitted).toLocaleString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(complaint.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{complaint.description}</p>
                  {complaint.admin_remark && (
                    <div className="bg-muted p-3 rounded-md mt-2">
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

      <Dialog open={!!selectedComplaint} onOpenChange={(open) => !open && setSelectedComplaint(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Complaint</DialogTitle>
            <DialogDescription>
              Modify the status and add remarks for this complaint
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-semibold mb-2">{selectedComplaint.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedComplaint.students.name} ({selectedComplaint.students.reg_no})
                </p>
                <p className="text-sm">{selectedComplaint.description}</p>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={updateForm.status}
                  onValueChange={(value) => setUpdateForm({ ...updateForm, status: value as "Pending" | "In Progress" | "Resolved" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Admin Remarks</Label>
                <Textarea
                  placeholder="Add your response or resolution notes"
                  rows={4}
                  value={updateForm.admin_remark}
                  onChange={(e) => setUpdateForm({ ...updateForm, admin_remark: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelectedComplaint(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateComplaint}>Update Complaint</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
