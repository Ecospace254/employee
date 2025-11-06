import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { motion } from "motion/react";

interface WelcomeHeroProps {
  userName?: string;
}

export default function WelcomeHero({ userName }: WelcomeHeroProps) {

  return (
    <div className=" lg:bg-primary bg-primary px-4 py-8 rounded-lg mb-8">
      <div className="items-center">
        <div className="mb-4">
          <div className="text-sm font-semibold text-primary-foreground/80 mb-2">
            ECOSPACE SERVICES LIMITED
          </div>
          <motion.h1
            className="text-3xl font-bold text-primary-foreground mb-2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.2
            }}
            data-testid="text-welcome-title">
            Your onboarding journey starts here!
          </motion.h1>
          <motion.p
            className="text-base text-primary-foreground/90 leading-relaxed"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.9, // No animation on desktop
              delay: 0.2
            }}
          >
            Welcome! We are so happy you are here. Consider this your home base to find the support and resources you need to be successful on your new team.
          </motion.p>
        </div>
        
        <div className="relative">
          <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
            {/* YouTube video placeholder */}
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/hqQYUVFyZuQ?si=AiEo9blJuCmOOQK9"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen>
            </iframe>
          </div>

          <div className="text-center mt-4">
            <div className="text-primary-foreground/90 font-semibold italic text-sm">KARIBU</div>
          </div>
        </div>
        
      </div>
    </div>
  );
}