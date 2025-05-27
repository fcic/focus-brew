import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { IconCoffee, IconCreditCard } from "@tabler/icons-react";

export function DonationDialog() {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-[10001] bg-primary/80 text-primary-foreground hover:bg-primary/95"
        >
          ❤️
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Support FocusBrew</DialogTitle>
          <DialogDescription>
            Help keep this project alive by making a donation. Thank you for
            your support!
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="brazil" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="brazil">Brazil (PIX)</TabsTrigger>
            <TabsTrigger value="international">International</TabsTrigger>
          </TabsList>
          <TabsContent value="brazil" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>PIX</CardTitle>
                <CardDescription>
                  Scan the QR code or copy the PIX key
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-48 h-48 flex items-center justify-center rounded-md mb-4">
                    <Image
                      src="/images/PIX.jpeg"
                      alt="PIX QR Code"
                      className="rounded-md"
                      width={192}
                      height={192}
                    />
                  </div>
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input
                      value="1fd38e1f-de40-4bd5-b613-3687e99a1ee2"
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(
                          "1fd38e1f-de40-4bd5-b613-3687e99a1ee2",
                          "PIX key"
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="international" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-4">
                <Button
                  variant="outline"
                  className="w-full flex justify-between items-center h-auto py-3"
                  onClick={() =>
                    window.open(
                      "https://buymeacoffee.com/birobirobiro/",
                      "_blank"
                    )
                  }
                >
                  <span>Buy Me a Coffee</span>
                  <IconCoffee className="h-5 w-5" />
                </Button>
              </Card>

              <Card className="p-4">
                <Button
                  variant="outline"
                  className="w-full flex justify-between items-center h-auto py-3"
                  onClick={() =>
                    window.open(
                      "https://buy.stripe.com/6oU3cwbNedbpaz02Yw0Jq01",
                      "_blank"
                    )
                  }
                >
                  <span>Stripe</span>
                  <IconCreditCard className="h-5 w-5" />
                </Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
