/**
 * CreateSession.tsx
 * =================
 * Form for teachers to create a new attendance session
 * 
 * Fields:
 * - Semester (1st/2nd)
 * - Year (23-26)
 * - Shift (Morning/Evening)
 * - Class name & optional Group
 * - Date (auto-filled)
 * - Session Type (Theory/Practical)
 * - Course Name
 * - Expected Batch Size
 * - Attendance Time Duration (2-5 min)
 * - Class Time (From-To with presets)
 * - Additional Notes (optional)
 * 
 * On submit: Navigates to SessionLive with session data
 */

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, Calendar, Clock, Users, BookOpen, 
  Check, Sun, Moon, FlaskConical, BookText, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Common class time presets starting at 08:30, incrementing by 1 hour
const TIME_PRESETS = [
  { label: "08:30 - 09:30", from: "08:30", to: "09:30" },
  { label: "09:30 - 10:30", from: "09:30", to: "10:30" },
  { label: "10:30 - 11:30", from: "10:30", to: "11:30" },
  { label: "11:30 - 12:30", from: "11:30", to: "12:30" },
  { label: "12:30 - 13:30", from: "12:30", to: "13:30" },
  { label: "13:30 - 14:30", from: "13:30", to: "14:30" },
];

export default function CreateSession() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Teacher ID passed from RoleSelection
  const teacherId = location.state?.teacherId || "";

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");

  // Field-level validation errors keyed by backend field names
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Use a single form object whose keys match backend field names exactly
  type SessionForm = {
    teacherId: string;
    semester: string;
    class: string; // backend field `class`
    group?: string | null;
    courseName: string;
    courseNumber?: string;
    sessionType: "theory" | "practical" | "";
    sessionDate: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    location?: string;
  };

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState<SessionForm>({
    teacherId: teacherId,
    semester: "",
    class: "",
    group: null,
    courseName: "",
    courseNumber: "",
    sessionType: "",
    sessionDate: today,
    // default timers start at 08:30
    startTime: "08:30",
    endTime: "09:30",
    location: "",
  });
  // Submission states and messages
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  /**
   * Apply a time preset to the start/end fields
   */
  const applyTimePreset = (from: string, to: string) => {
    setForm(prev => ({ ...prev, startTime: from, endTime: to }));
  };

  /**
   * Validate form and create session
   * All required fields must be filled
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Field-level validation
    const newErrors: Record<string, string> = {};
    if (!form.semester) newErrors.semester = "Semester is required";
    if (!form['class']) newErrors.class = "Class is required";
    if (!form.sessionType) newErrors.sessionType = "Session type is required";
    if (!form.courseName) newErrors.courseName = "Course name is required";
    if (!form.sessionDate) newErrors.sessionDate = "Session date is required";
    if (!form.startTime) newErrors.startTime = "Start time is required";
    if (!form.endTime) newErrors.endTime = "End time is required";

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setError("Please correct the highlighted fields");
      return;
    }

    setIsCreating(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    // Prepare session data for API (POST /api/v1/sessions)
    const sessionData = { ...form };

    // Use centralized API helper (no backend calls until feature flag enabled)
    try {
      const api = (await import("@/lib/api")).default;
      const result = await api.createSession(sessionData);

      if (!result.ok) {
        if (result.status === "validation" && result.errors) {
          setFieldErrors(result.errors);
        }
        setSubmitError(result.message ?? "Failed to create session");
        setIsCreating(false);
        return;
      }

      const sessionId = result.data.id ?? `session-${Date.now()}`;
      setSubmitSuccess(true);

      // Navigate to live session using returned id
      navigate(`/teacher/session/${sessionId}/live`, {
        state: { sessionData: { ...sessionData, id: sessionId } },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setSubmitError(`Failed to submit /api/v1/sessions: ${message || 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-8 pb-16 px-6">
        <div className="container mx-auto max-w-2xl">
          {/* Back navigation */}
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl font-display">Create Attendance Session</CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* === Semester and Year Row === */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Semester *</Label>
                    <Select value={form.semester} onValueChange={(v) => { setForm(prev => ({ ...prev, semester: v })); setFieldErrors(prev => ({ ...prev, semester: "" })); }}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Select Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Semester</SelectItem>
                        <SelectItem value="2">2nd Semester</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Course number removed from UI (kept in form state) */}
                </div>

                {/* === Shift Selection (Morning/Evening) === */}
                {/* Optional: Session location */}
                {/* Location removed from UI (kept in form state) */}

                {/* === Class and Group === */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="classField" className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Class *
                    </Label>
                    <Input
                      id="classField"
                      placeholder="e.g., SWE Part III"
                      value={form['class']}
                      onChange={(e) => { setForm(prev => ({ ...prev, class: e.target.value })); setFieldErrors(prev => ({ ...prev, class: "" })); }}
                      className="bg-secondary border-border"
                    />
                    {fieldErrors.class && <p className="text-destructive text-sm mt-1">{fieldErrors.class}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group">Group</Label>
                    <Input
                      id="group"
                      placeholder="e.g., A or B"
                      value={form.group || ""}
                      onChange={(e) => setForm(prev => ({ ...prev, group: e.target.value }))}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>

                {/* === Date (Auto-filled, read-only) === */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Session Date *
                  </Label>
                  <Input
                    type="date"
                    value={form.sessionDate}
                    onChange={(e) => { setForm(prev => ({ ...prev, sessionDate: e.target.value })); setFieldErrors(prev => ({ ...prev, sessionDate: "" })); }}
                    className="bg-secondary border-border sm:w-40 w-full"
                  />
                  {fieldErrors.sessionDate && <p className="text-destructive text-sm mt-1">{fieldErrors.sessionDate}</p>}
                </div>

                {/* === Session Type (Theory/Practical) === */}
                <div className="space-y-2">
                  <Label>Session Type *</Label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={form.sessionType === "theory" ? "default" : "outline"}
                      onClick={() => { setForm(prev => ({ ...prev, sessionType: "theory" })); setFieldErrors(prev => ({ ...prev, sessionType: "" })); }}
                      className="flex-1 gap-2"
                    >
                      <BookText className="w-4 h-4" />
                      Theory
                    </Button>
                    <Button
                      type="button"
                      variant={form.sessionType === "practical" ? "default" : "outline"}
                      onClick={() => { setForm(prev => ({ ...prev, sessionType: "practical" })); setFieldErrors(prev => ({ ...prev, sessionType: "" })); }}
                      className="flex-1 gap-2"
                    >
                      <FlaskConical className="w-4 h-4" />
                      Practical
                    </Button>
                  </div>
                  {fieldErrors.sessionType && <p className="text-destructive text-sm mt-1">{fieldErrors.sessionType}</p>}
                </div>

                {/* === Course Name === */}
                <div className="space-y-2">
                  <Label htmlFor="courseName">Course Name *</Label>
                  <Input
                    id="courseName"
                    placeholder="e.g., Data Structures"
                    value={form.courseName}
                    onChange={(e) => { setForm(prev => ({ ...prev, courseName: e.target.value })); setFieldErrors(prev => ({ ...prev, courseName: "" })); }}
                    className="bg-secondary border-border"
                  />
                  {fieldErrors.courseName && <p className="text-destructive text-sm mt-1">{fieldErrors.courseName}</p>}
                </div>

                {/* === Expected Batch Size === */}
                {/* === Class Time (Start-End) with Presets === */}
                <div className="space-y-2">
                  <Label>Class Time *</Label>

                  {/* Quick presets for compact times - centered, wider and shorter */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {TIME_PRESETS.map((preset) => (
                      <Button
                        key={preset.label}
                        type="button"
                        variant="outline"
                        onClick={() => applyTimePreset(preset.from, preset.to)}
                        className={`text-xs w-28 h-10 flex items-center justify-center ${form.startTime === preset.from && form.endTime === preset.to ? 'border-primary bg-primary/10' : ''}`}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>

                  {/* Manual time inputs - centered and compact */}
                  <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                    <div className="space-y-1">
                      <Label htmlFor="startTime" className="text-xs text-muted-foreground text-center">Start</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={form.startTime}
                        onChange={(e) => { setForm(prev => ({ ...prev, startTime: e.target.value })); setFieldErrors(prev => ({ ...prev, startTime: "" })); }}
                        className="bg-secondary border-border h-10 text-center"
                      />
                      {fieldErrors.startTime && <p className="text-destructive text-sm mt-1">{fieldErrors.startTime}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="endTime" className="text-xs text-muted-foreground text-center">End</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={form.endTime}
                        onChange={(e) => { setForm(prev => ({ ...prev, endTime: e.target.value })); setFieldErrors(prev => ({ ...prev, endTime: "" })); }}
                        className="bg-secondary border-border h-10 text-center"
                      />
                      {fieldErrors.endTime && <p className="text-destructive text-sm mt-1">{fieldErrors.endTime}</p>}
                    </div>
                  </div>
                </div>

                {/* === Additional Notes (Optional) === */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-secondary border-border min-h-[80px]"
                  />
                </div>

                {/* === Error Display - Centered, themed === */}
                {(error || submitError) && (
                  <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-secondary border border-border">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">{submitError ?? error}</span>
                  </div>
                )}

                {/* Success placeholder */}
                {submitSuccess && (
                  <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-primary/10 border border-primary">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-primary">Success!</span>
                  </div>
                )}

                {/* === Submit Button === */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isCreating}
                  className="w-full gap-2"
                >
                      {isCreating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Creating Session...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Start Session (will POST /api/v1/sessions)
                        </>
                      )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
