import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [settings, setSettings] = useState({
    organizationName: "EcoTech Innovators",
    mapCenter: "40.7128, -74.0060",
    autoAssignment: "enabled",
    emailNotifications: true,
    smsAlerts: false,
  });
  
  const { toast } = useToast();

  const handleSave = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Settings saved",
      description: "Your settings have been successfully updated.",
    });
  };

  const handleCancel = () => {
    // Reset to default values
    setSettings({
      organizationName: "EcoTech Innovators",
      mapCenter: "40.7128, -74.0060",
      autoAssignment: "enabled",
      emailNotifications: true,
      smsAlerts: false,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      data-testid="page-settings"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage system configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* System Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="rounded-2xl shadow-sm" data-testid="card-system-settings">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">System Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="org-name" className="text-sm font-medium text-foreground">
                  Organization Name
                </Label>
                <Input
                  id="org-name"
                  value={settings.organizationName}
                  onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                  className="mt-2"
                  data-testid="input-organization-name"
                />
              </div>
              <div>
                <Label htmlFor="map-center" className="text-sm font-medium text-foreground">
                  Default Map Center
                </Label>
                <Input
                  id="map-center"
                  value={settings.mapCenter}
                  onChange={(e) => setSettings({ ...settings, mapCenter: e.target.value })}
                  className="mt-2"
                  data-testid="input-map-center"
                />
              </div>
              <div>
                <Label htmlFor="auto-assignment" className="text-sm font-medium text-foreground">
                  Report Auto-Assignment
                </Label>
                <Select 
                  value={settings.autoAssignment} 
                  onValueChange={(value) => setSettings({ ...settings, autoAssignment: value })}
                >
                  <SelectTrigger className="mt-2" data-testid="select-auto-assignment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="rounded-2xl shadow-sm" data-testid="card-notification-settings">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive email alerts for urgent reports</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  data-testid="switch-email-notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">SMS Alerts</p>
                  <p className="text-xs text-muted-foreground">Get SMS for high priority reports</p>
                </div>
                <Switch
                  checked={settings.smsAlerts}
                  onCheckedChange={(checked) => setSettings({ ...settings, smsAlerts: checked })}
                  data-testid="switch-sms-alerts"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        className="flex justify-end space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Button 
          variant="outline" 
          onClick={handleCancel}
          data-testid="button-cancel-settings"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          data-testid="button-save-settings"
        >
          Save Changes
        </Button>
      </motion.div>
    </motion.div>
  );
}
