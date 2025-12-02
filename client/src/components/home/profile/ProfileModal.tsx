import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Camera, Save, X, User, Mail, Briefcase, Calendar, Crop, ChevronDown, Phone, Info } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from "@/components/ui/select";
import ReactCrop, { Crop as CropType, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { departments } from "@/data/departments";
import { extractDepartmentFromRole } from "@/utils/departmentHelpers";
import { DepartmentGuideModal } from "@/components/auth/DepartmentGuideModal";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { user } = useAuth();

    // Collapsible states
    const [openPersonal, setOpenPersonal] = useState(true);
    const [openContact, setOpenContact] = useState(true);
    const [openEducation, setOpenEducation] = useState(true);
    const [showDepartmentGuide, setShowDepartmentGuide] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    // Editable field states - Personal Information
    const [firstNameField, setFirstNameField] = useState(() => user?.firstName ?? "");
    const [lastNameField, setLastNameField] = useState(() => user?.lastName ?? "");
    const [jobTitleField, setJobTitleField] = useState(() => user?.jobTitle ?? "");
    const [departmentField, setDepartmentField] = useState(() => user?.department ?? "");
    const [nationalIdField, setNationalIdField] = useState(() => (user as any)?.nationalId ?? "");
    const [birthDateField, setBirthDateField] = useState(() => (user as any)?.birthDate ?? "");
    const [genderField, setGenderField] = useState(() => (user as any)?.gender ?? "");
    // Contact fields
    const [mobileField, setMobileField] = useState(() => (user as any)?.mobile ?? "");
    // Education fields
    const [collegeField, setCollegeField] = useState(() => (user as any)?.college ?? "");
    const [degreeField, setDegreeField] = useState(() => (user as any)?.degree ?? "");
    const [majorField, setMajorField] = useState(() => (user as any)?.major ?? "");
    const [eduStartField, setEduStartField] = useState(() => (user as any)?.educationStart ?? "");
    const [eduEndField, setEduEndField] = useState(() => (user as any)?.educationEnd ?? "");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Cropping states
    const [showCropDialog, setShowCropDialog] = useState(false);
    const [imageSrc, setImageSrc] = useState<string>("");
    const [crop, setCrop] = useState<CropType>({
        unit: '%',
        width: 80,
        height: 80,
        x: 10,
        y: 10,
    });
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const imgRef = useRef<HTMLImageElement>(null);

    // Auto-update department when job title changes
    useEffect(() => {
        if (jobTitleField && isEditing) {
            const extractedDept = extractDepartmentFromRole(jobTitleField);
            if (extractedDept) {
                setDepartmentField(extractedDept);
            }
        }
    }, [jobTitleField, isEditing]);

    if (!user) return null;

    const getInitials = () => {
        return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        // Validate file type and size here if needed
        if (!file.type.startsWith("image/")) {
            toast({
                title: "Invalid file type",
                description: "Please select an image file",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (e.g., max 5MB
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            toast({
                title: "File too large",
                description: "Please select an image that is less than 5MB",
                variant: "destructive",
            });
            return;
        }

        // Read file for cropping
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageSrc(reader.result as string);
            setShowCropDialog(true);
        };
        reader.readAsDataURL(file);
    }

    // Function to create cropped image
    const getCroppedImg = async (): Promise<Blob | null> => {
        if (!completedCrop || !imgRef.current) {
            return null;
        }

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return null;
        }

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        // Set canvas size to the crop size
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;

        // Draw the cropped image
        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width,
            completedCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.95);
        });
    }

    // Handle crop confirmation
    const handleCropConfirm = async () => {
        const croppedBlob = await getCroppedImg();

        if (!croppedBlob) {
            toast({
                title: "Crop failed",
                description: "Please try selecting the image again.",
                variant: "destructive",
            });
            return;
        }

        // Convert blob to file
        const croppedFile = new File([croppedBlob], "profile-image.jpg", {
            type: "image/jpeg",
        });

        setSelectedFile(croppedFile);

        // Create preview URL
        const previewReader = new FileReader();
        previewReader.onloadend = () => {
            setPreviewUrl(previewReader.result as string);
        };
        previewReader.readAsDataURL(croppedFile);

        setShowCropDialog(false);
        toast({
            title: "Photo cropped",
            description: "Click 'Save Changes' to upload your cropped photo.",
            variant: "success",
        });
    }


    // Function to upload file to the server
    const uploadProfilePhoto = async () => {
        if (!selectedFile) return;

        try {
            // Create FormData to send File 
            const formData = new FormData();
            formData.append('profileImage', selectedFile);

            // Make API call to upload the image- send to the API endpoint
            const response = await fetch('/api/user/profile-image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            const data = await response.json();

            toast({
                title: "Profile Photo Updated!",
                description: "Your profile photo has been successfully updated.",
                variant: "success",
            });

            // Clear preview and selected file
            setPreviewUrl(null);
            setSelectedFile(null);

            // Refresh user data to update the Header avatar
            queryClient.invalidateQueries({ queryKey: ['/api/user'] });

        } catch (error) {
            toast({
                title: "Upload failed",
                description: "There was an error uploading your photo.",
                variant: "destructive",
            });
        }
    }

    // Function to update profile fields
    const updateProfileFields = async () => {
        try {
            const updates = {
                firstName: firstNameField,
                lastName: lastNameField,
                jobTitle: jobTitleField,
                department: departmentField,
                nationalId: nationalIdField || undefined,
                birthDate: birthDateField || undefined,
                gender: genderField || undefined,
                mobile: mobileField || undefined,
                college: collegeField || undefined,
                degree: degreeField || undefined,
                major: majorField || undefined,
                educationStart: eduStartField || undefined,
                educationEnd: eduEndField || undefined,
            };

            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error("Update failed");
            }

            await response.json();

            toast({
                title: "Profile Updated!",
                description: "Your profile information has been successfully updated.",
                variant: "success",
            });

            // Refresh user data
            queryClient.invalidateQueries({ queryKey: ['/api/user'] });

        } catch (error) {
            toast({
                title: "Update failed",
                description: "There was an error updating your profile.",
                variant: "destructive",
            });
        }
    }

    return (
        <>
            {/* Crop Dialog */}
            <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
                <DialogContent className="w-[95vw] sm:w-full sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col bg-background rounded-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                            <Crop className="w-4 h-4" />
                            Crop Your Photo
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="flex items-center justify-center">
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={1}
                                circularCrop
                            >
                                <img
                                    ref={imgRef}
                                    src={imageSrc}
                                    alt="Crop preview"
                                    className="max-h-[45vh] w-auto"
                                />
                            </ReactCrop>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between gap-2 p-3 border-t">
                        <Button
                            variant="outline"
                            onClick={() => {
                                // Keep crop dialog open but allow choosing new photo
                                document.getElementById('avatar-upload')?.click();
                            }}
                            className="w-full sm:w-auto"
                        >
                            Choose Another Photo
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCropDialog(false);
                                    setImageSrc("");
                                    setPreviewUrl(null);
                                    setSelectedFile(null);
                                }}
                                className="flex-1 sm:flex-none"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCropConfirm}
                                className="flex-1 sm:flex-none"
                            >
                                Apply Crop
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Profile Dialog */}
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="w-[95vw] sm:w-full sm:max-w-[600px] max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col bg-blue-50 dark:bg-slate-900 rounded-md p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl font-semibold text-primary dark:text-white">My Profile</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 sm:space-y-6 overflow-y-auto p-2 sm:p-4">
                        {/* Avatar/Image Section */}
                        <div className="flex flex-col items-center justify-center space-y-1 sm:space-y-2 py-3 sm:py-5 bg-primary/10 dark:bg-slate-800 min-h-[200px] sm:min-h-[250px]">
                            <div className="relative space-y-1">
                                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-2 sm:border-4 border-background dark:border-slate-700 shadow-lg">
                                    <AvatarImage src={previewUrl || user.profileImage || undefined} />
                                    <AvatarFallback className="text-2xl sm:text-3xl bg-primary/10 dark:bg-slate-700 dark:text-white">
                                        {getInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <Input
                                    type="file"
                                    id="avatar-upload"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={!isEditing}
                                />
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full shadow-md w-8 h-8 sm:w-10 sm:h-10 dark:bg-slate-700 dark:hover:bg-slate-600"
                                    onClick={() => document.getElementById("avatar-upload")?.click()}
                                    disabled={!isEditing}
                                    title={!isEditing ? "Click 'Edit Profile' to change photo" : "Change photo"}
                                >
                                    <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                            </div>
                            <div className="text-center">
                                <h2 className="text-xl sm:text-2xl font-bold capitalize dark:text-white">
                                    {user.firstName} {user.lastName}
                                </h2>
                                <p className="text-sm sm:text-base capitalize text-muted-foreground dark:text-gray-300">{user.jobTitle || user.role}</p>
                                {user.department && (
                                    <Badge variant="secondary" className="mt-2 text-xs sm:text-sm capitalize dark:bg-slate-700 dark:text-white">
                                        {user.department}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Hidden description for screen readers */}
                        {!isEditing && (
                            <div id="edit-mode-instruction" className="sr-only">
                                Click the 'Edit Profile' button at the bottom to edit this field
                            </div>
                        )}

                        {/* Personal Information */}
                        <Collapsible open={openPersonal} onOpenChange={setOpenPersonal}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg sm:text-xl text-primary dark:text-white font-semibold">Personal Information</h2>
                                <CollapsibleTrigger asChild>
                                    <button
                                        className="p-2 rounded-md hover:bg-primary/5 dark:hover:bg-slate-700 dark:text-white"
                                        aria-label={openPersonal ? "Collapse personal information" : "Expand personal information"}
                                        title={openPersonal ? "Collapse" : "Expand"}
                                    >
                                        <ChevronDown className={`w-4 h-4 transition-transform ${openPersonal ? "rotate-180" : ""}`} />
                                    </button>
                                </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent>
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        {/* First Name */}
                                        <div className="space-y-1.5 sm:space-y-2">
                                            <Label className="flex items-center gap-2 text-sm dark:text-gray-200">
                                                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary dark:text-blue-400" />
                                                First Name
                                            </Label>
                                            <Input
                                                value={firstNameField}
                                                onChange={(e) => setFirstNameField(e.target.value)}
                                                disabled={!isEditing}
                                                aria-describedby={!isEditing ? "edit-mode-instruction" : undefined}
                                                title={!isEditing ? "Click 'Edit Profile' button below to edit this field" : ""}
                                                className="bg-muted/50 dark:bg-slate-800 dark:text-white dark:border-slate-600 text-sm sm:text-base"
                                            />
                                        </div>

                                        {/* Last Name */}
                                        <div className="space-y-1.5 sm:space-y-2">
                                            <Label className="flex items-center gap-2 text-sm dark:text-gray-200">
                                                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary dark:text-blue-400" />
                                                Last Name
                                            </Label>
                                            <Input
                                                value={lastNameField}
                                                onChange={(e) => setLastNameField(e.target.value)}
                                                disabled={!isEditing}
                                                aria-describedby={!isEditing ? "edit-mode-instruction" : undefined}
                                                title={!isEditing ? "Click 'Edit Profile' button below to edit this field" : ""}
                                                className="bg-muted/50 dark:bg-slate-800 dark:text-white dark:border-slate-600 text-sm sm:text-base"
                                            />
                                        </div>

                                        {/* Job Title */}
                                        <div className="space-y-1.5 sm:space-y-2">
                                            <Label className="flex items-center gap-2 text-sm dark:text-gray-200">
                                                <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary dark:text-blue-400" />
                                                Job Title / Role
                                            </Label>
                                            {isEditing ? (
                                                <div className="flex gap-2">
                                                    <Select
                                                        value={jobTitleField}
                                                        onValueChange={setJobTitleField}
                                                        disabled={!isEditing}
                                                    >
                                                        <SelectTrigger className="flex-1 bg-muted/50 dark:bg-slate-800 dark:text-white dark:border-slate-600 text-sm sm:text-base text-left">
                                                            <SelectValue placeholder="Select your role..." />
                                                        </SelectTrigger>
                                                        <SelectContent className="max-h-[300px]">
                                                            {departments.map((dept, deptIndex) => (
                                                                <div key={dept.id}>
                                                                    {deptIndex > 0 && <SelectSeparator />}
                                                                    <SelectGroup>
                                                                        <SelectLabel>{dept.name}</SelectLabel>
                                                                        {dept.roles.map((role) => (
                                                                            <SelectItem key={role} value={role}>
                                                                                {role}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectGroup>
                                                                </div>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setShowDepartmentGuide(true)}
                                                        className="flex-shrink-0"
                                                        title="View department guide"
                                                    >
                                                        <Info className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Input
                                                    value={jobTitleField}
                                                    disabled
                                                    className="bg-muted/50 dark:bg-slate-800 dark:text-white dark:border-slate-600 text-sm sm:text-base"
                                                />
                                            )}
                                        </div>

                                        {/* Department */}
                                        <div className="space-y-1.5 sm:space-y-2">
                                            <Label className="flex items-center gap-2 text-sm dark:text-gray-200">
                                                <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary dark:text-blue-400" />
                                                Department
                                                {isEditing && (
                                                    <Badge variant="secondary" className="text-xs ml-auto">
                                                        Auto-filled
                                                    </Badge>
                                                )}
                                            </Label>
                                            <Input
                                                value={departmentField}
                                                disabled
                                                className="bg-muted/50 dark:bg-slate-800 dark:text-white dark:border-slate-600 text-sm sm:text-base"
                                                title="Department is automatically set based on your job title"
                                            />
                                        </div>

                                        {/* Birth Date */}
                                        <div className="space-y-1.5 sm:space-y-2">
                                            <Label className="flex items-center gap-2 text-sm dark:text-gray-200">
                                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary dark:text-blue-400" />
                                                Birth Date
                                            </Label>
                                            <Input
                                                type="date"
                                                value={birthDateField}
                                                onChange={(e) => setBirthDateField(e.target.value)}
                                                disabled={!isEditing}
                                                aria-describedby={!isEditing ? "edit-mode-instruction" : undefined}
                                                title={!isEditing ? "Click 'Edit Profile' button below to edit this field" : ""}
                                                className="bg-muted/50 dark:bg-slate-800 dark:text-white dark:border-slate-600 text-sm sm:text-base"
                                            />
                                        </div>

                                        {/* Gender */}
                                        <div className="space-y-1.5 sm:space-y-2">
                                            <Label className="text-sm dark:text-gray-200">Gender</Label>
                                            <Input
                                                value={genderField}
                                                onChange={(e) => setGenderField(e.target.value)}
                                                disabled={!isEditing}
                                                aria-describedby={!isEditing ? "edit-mode-instruction" : undefined}
                                                title={!isEditing ? "Click 'Edit Profile' button below to edit this field" : ""}
                                                placeholder="e.g. Male, Female, Other"
                                                className="bg-muted/50 dark:bg-slate-800 dark:text-white dark:border-slate-600 text-sm sm:text-base"
                                            />
                                        </div>

                                        {/* Start Date (read-only) */}
                                        <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                                            <Label className="flex items-center gap-2 text-sm dark:text-gray-200">
                                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary dark:text-blue-400" />
                                                Start Date
                                            </Label>
                                            <Input
                                                value={user.startDate ? new Date(user.startDate).toLocaleDateString() : "Not specified"}
                                                disabled
                                                className="bg-muted/50 dark:bg-slate-800 dark:text-white dark:border-slate-600 text-sm sm:text-base"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Contact Information */}
                        <Collapsible open={openContact} onOpenChange={setOpenContact}>
                            <div className="flex items-center justify-between pt-3 mb-4">
                                <h2 className="text-lg sm:text-xl text-primary dark:text-white font-semibold">Contact Information</h2>
                                <CollapsibleTrigger asChild>
                                    <button
                                        className="p-2 rounded-md hover:bg-primary/5 dark:hover:bg-slate-700 dark:text-white"
                                        aria-label={openContact ? "Collapse contact information" : "Expand contact information"}
                                        title={openContact ? "Collapse" : "Expand"}
                                    >
                                        <ChevronDown className={`w-4 h-4 transition-transform ${openContact ? "rotate-180" : ""}`} />
                                    </button>
                                </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent>
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        {/* Email (read-only) */}
                                        <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                                            <Label className="flex items-center gap-2 text-sm dark:text-gray-200">
                                                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary dark:text-blue-400" />
                                                Email
                                            </Label>
                                            <Input
                                                value={user.email || "Not provided"}
                                                disabled
                                                className="bg-muted/50 dark:bg-slate-800 dark:text-white dark:border-slate-600 text-sm sm:text-base"
                                            />
                                        </div>

                                        {/* National ID */}
                                        <div className="space-y-1.5 sm:space-y-2">
                                            <Label className="text-sm dark:text-gray-200">National ID</Label>
                                            <Input
                                                value={nationalIdField}
                                                onChange={(e) => setNationalIdField(e.target.value)}
                                                disabled={!isEditing}
                                                aria-describedby={!isEditing ? "edit-mode-instruction" : undefined}
                                                title={!isEditing ? "Click 'Edit Profile' button below to edit this field" : ""}
                                                placeholder="e.g. 12345678"
                                                className="bg-muted/50 dark:bg-slate-800 dark:text-white dark:border-slate-600 text-sm sm:text-base"
                                            />
                                        </div>

                                        {/* Mobile */}
                                        <div className="space-y-1.5 sm:space-y-2">
                                            <Label className="text-sm flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary dark:text-blue-400" />
                                                Mobile Number
                                            </Label>
                                            <Input
                                                value={mobileField}
                                                onChange={(e) => setMobileField(e.target.value)}
                                                disabled={!isEditing}
                                                aria-describedby={!isEditing ? "edit-mode-instruction" : undefined}
                                                title={!isEditing ? "Click 'Edit Profile' button below to edit this field" : ""}
                                                placeholder="e.g. +1 (555) 555-5555            "
                                                className="bg-muted/50 dark:bg-slate-800 dark:text-white dark:border-slate-600 text-sm sm:text-base"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Education Information */}
                        <Collapsible open={openEducation} onOpenChange={setOpenEducation}>
                            <div className="flex items-center justify-between pt-3 mb-3">
                                <div>
                                    <h2 className="text-lg sm:text-xl text-primary dark:text-white font-semibold">Education Information</h2>
                                </div>
                                <CollapsibleTrigger asChild>
                                    <button
                                        className="p-2 rounded-md hover:bg-primary/5 dark:hover:bg-slate-700 dark:text-white"
                                        aria-label={openEducation ? "Collapse education information" : "Expand education information"}
                                        title={openEducation ? "Collapse" : "Expand"}
                                    >
                                        <ChevronDown className={`w-4 h-4 transition-transform ${openEducation ? "rotate-180" : ""}`} />
                                    </button>
                                </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent>
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="space-y-1.5 sm:space-y-2">
                                            <Label className="text-sm dark:text-gray-200">College/Institution</Label>
                                            <Input
                                                value={collegeField}
                                                onChange={(e) => setCollegeField(e.target.value)}
                                                disabled={!isEditing}
                                                aria-describedby={!isEditing ? "edit-mode-instruction" : undefined}
                                                title={!isEditing ? "Click 'Edit Profile' button below to edit this field" : ""}
                                                placeholder="e.g. University of Example"
                                                className="bg-muted/50 dark:bg-slate-800 dark:text-white dark:border-slate-600 text-sm sm:text-base"
                                            />
                                        </div>

                                        <div className="space-y-1.5 sm:space-y-2">
                                            <Label className="text-sm dark:text-gray-200">Degree</Label>
                                            <Input
                                                value={degreeField}
                                                onChange={(e) => setDegreeField(e.target.value)}
                                                disabled={!isEditing}
                                                aria-describedby={!isEditing ? "edit-mode-instruction" : undefined}
                                                title={!isEditing ? "Click 'Edit Profile' button below to edit this field" : ""}
                                                placeholder="e.g. Bachelor's, Master's"
                                                className="bg-muted/50 dark:bg-slate-800 dark:text-white dark:border-slate-600 text-sm sm:text-base"
                                            />
                                        </div>

                                        <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                                            <Label className="text-sm dark:text-gray-200">Major/Specialization</Label>
                                            <Input
                                                value={majorField}
                                                onChange={(e) => setMajorField(e.target.value)}
                                                disabled={!isEditing}
                                                aria-describedby={!isEditing ? "edit-mode-instruction" : undefined}
                                                title={!isEditing ? "Click 'Edit Profile' button below to edit this field" : ""}
                                                placeholder="e.g. Computer Science"
                                                className="bg-muted/50 dark:bg-slate-800 dark:text-white dark:border-slate-600 text-sm sm:text-base"
                                            />
                                        </div>

                                        <div className="space-y-1.5 sm:space-y-2">
                                            <Label className="text-sm dark:text-gray-200">Start Date</Label>
                                            <Input
                                                type="date"
                                                value={eduStartField}
                                                onChange={(e) => setEduStartField(e.target.value)}
                                                disabled={!isEditing}
                                                aria-describedby={!isEditing ? "edit-mode-instruction" : undefined}
                                                title={!isEditing ? "Click 'Edit Profile' button below to edit this field" : ""}
                                                className="bg-muted/50 dark:bg-slate-800 dark:text-white dark:border-slate-600 text-sm sm:text-base"
                                            />
                                        </div>

                                        <div className="space-y-1.5 sm:space-y-2">
                                            <Label className="text-sm dark:text-gray-200">End Date</Label>
                                            <Input
                                                type="date"
                                                value={eduEndField}
                                                onChange={(e) => setEduEndField(e.target.value)}
                                                disabled={!isEditing}
                                                aria-describedby={!isEditing ? "edit-mode-instruction" : undefined}
                                                title={!isEditing ? "Click 'Edit Profile' button below to edit this field" : ""}
                                                className="bg-muted/50 dark:bg-slate-800 dark:text-white dark:border-slate-600 text-sm sm:text-base"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-auto text-sm sm:text-base"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setSelectedFile(null);
                                            setPreviewUrl(null);
                                            // Reset all fields to original values
                                            setFirstNameField(user.firstName || "");
                                            setLastNameField(user.lastName || "");
                                            setJobTitleField(user.jobTitle || "");
                                            setDepartmentField(user.department || "");
                                            setNationalIdField((user as any).nationalId || "");
                                            setBirthDateField((user as any).birthDate || "");
                                            setGenderField((user as any).gender || "");
                                            setMobileField((user as any).mobile || "");
                                            setCollegeField((user as any).college || "");
                                            setDegreeField((user as any).degree || "");
                                            setMajorField((user as any).major || "");
                                            setEduStartField((user as any).educationStart || "");
                                            setEduEndField((user as any).educationEnd || "");
                                            toast({ title: "Changes discarded" });
                                        }}
                                    >
                                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button
                                        className="w-full sm:w-auto text-sm sm:text-base"
                                        onClick={async () => {
                                            // Upload photo if a new one is selected
                                            if (selectedFile) {
                                                await uploadProfilePhoto();
                                            }

                                            // Update profile fields
                                            await updateProfileFields();

                                            setIsEditing(false);
                                        }}
                                    >
                                        <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    className="w-full sm:w-auto text-sm sm:text-base"
                                    onClick={() => {
                                        // Populate editable fields from latest user data
                                        setFirstNameField(user.firstName || "");
                                        setLastNameField(user.lastName || "");
                                        setJobTitleField(user.jobTitle || "");
                                        setDepartmentField(user.department || "");
                                        setNationalIdField((user as any).nationalId || "");
                                        setBirthDateField((user as any).birthDate || "");
                                        setGenderField((user as any).gender || "");
                                        setMobileField((user as any).mobile || "");
                                        setCollegeField((user as any).college || "");
                                        setDegreeField((user as any).degree || "");
                                        setMajorField((user as any).major || "");
                                        setEduStartField((user as any).educationStart || "");
                                        setEduEndField((user as any).educationEnd || "");
                                        setIsEditing(true);
                                    }}
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Department Guide Modal */}
            <DepartmentGuideModal
                open={showDepartmentGuide}
                onOpenChange={setShowDepartmentGuide}
            />
        </>
    );
}
