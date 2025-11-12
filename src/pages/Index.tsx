import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Shield, ClipboardList, CheckCircle2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <header className="bg-card/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">SNDP College</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/student-auth")}>
              Student Login
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin-auth")}>
              Admin Login
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Complaint Management System
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A streamlined platform for SNDP College students to submit and track complaints,
            ensuring timely resolutions and transparent communication.
          </p>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <GraduationCap className="w-12 h-12 text-primary mb-2" />
              <CardTitle>For Students</CardTitle>
              <CardDescription>
                Submit and track your complaints easily through our user-friendly portal
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Shield className="w-12 h-12 text-secondary mb-2" />
              <CardTitle>Secure</CardTitle>
              <CardDescription>
                Your data is protected with enterprise-grade security measures
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <ClipboardList className="w-12 h-12 text-primary mb-2" />
              <CardTitle>Organized</CardTitle>
              <CardDescription>
                Complaints are categorized and managed efficiently by department
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CheckCircle2 className="w-12 h-12 text-secondary mb-2" />
              <CardTitle>Transparent</CardTitle>
              <CardDescription>
                Real-time status updates and admin responses for complete transparency
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        <section className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="shadow-xl border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Students</CardTitle>
              <CardDescription>
                Create an account or login to submit complaints and track their progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" onClick={() => navigate("/student-auth")}>
                Access Student Portal
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Administrators</CardTitle>
              <CardDescription>
                Login to manage and respond to student complaints efficiently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" onClick={() => navigate("/admin-auth")}>
                Access Admin Portal
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="bg-card border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>© 2024 SNDP College. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
