// PopoverForm.tsx
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
  } from "@/components/ui/alert-dialog";
  import { Button } from "@/components/ui/button";
  import { Plus } from "lucide-react";
  
  export function PopoverForm() {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            className="flex items-center space-x-2 text-white transition-transform transform hover:scale-105 shadow-md"
          >
            <Plus className="h-5 w-5" />
            <span>Enter Details</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Proceed with caution.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
  