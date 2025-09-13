import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ExternalLink, Eye } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale:0.95 },
  show: { opacity: 1, y: 0, scale:1, transition: { type: "spring", stiffness: 180, damping:18 } }
};

const ViralVideos = ({ videos }) => {
  if (!videos || videos.length === 0) {
    return <p className="text-center text-muted-foreground">Nenhum vídeo viral configurado.</p>;
  }
  return (
    <motion.section 
      className="px-4"
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-10 md:mb-12 text-center gradient-text-purple-blue">Vídeos Virais</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        {videos.map((video, index) => (
          <motion.div 
            key={index} 
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0px 10px 20px hsla(var(--primary), 0.2)" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="video-card-container"
          >
            <a 
              href={video.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block no-underline group"
            >
              <Card className="overflow-hidden glass-effect border-border hover:border-primary/50 transition-all duration-300 ease-in-out h-full flex flex-col">
                <div className="relative aspect-video overflow-hidden">
                  <img-replace
                    src={video.thumbnailUrl || "/placeholder-images/default-video-thumb.jpg"}
                    alt={`Thumbnail para ${video.title}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 transition-opacity duration-300 group-hover:opacity-80"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="p-4 rounded-full bg-primary/80 text-white shadow-lg">
                      <Play size={32} fill="white" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs text-white/90 flex items-center">
                     <Eye size={12} className="mr-1" /> {video.views}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs text-white/90">
                    {video.platform}
                  </div>
                </div>
                <CardContent className="p-4 flex-grow">
                  <h3 className="font-semibold text-lg text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">{video.title}</h3>
                </CardContent>
                <div className="p-4 pt-0">
                   <Button variant="outline" size="sm" className="w-full border-primary/50 text-primary hover:bg-primary/10 hover:text-primary glow-on-hover">
                     Ver Vídeo <ExternalLink size={14} className="ml-2"/>
                   </Button>
                </div>
              </Card>
            </a>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default ViralVideos;