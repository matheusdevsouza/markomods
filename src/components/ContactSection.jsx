import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageSquare, MapPin } from "lucide-react";

const ContactSection = ({ contact }) => {
  
  const contactItems = [
    { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { icon: MessageSquare, label: "WhatsApp", value: "Fale Comigo!", href: contact.whatsappLink, target: "_blank" },
    { icon: Phone, label: "Telefone (Opcional)", value: contact.phone, href: `tel:${contact.phone}` },
    { icon: MapPin, label: "Localização", value: contact.location },
  ];

  return (
    <motion.section 
      className="px-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-10 md:mb-12 text-center gradient-text-purple-blue">Entre em Contato</h2>
      
      <div className="max-w-lg mx-auto glass-effect rounded-2xl p-6 md:p-8 border border-primary/20 shadow-2xl">
        <div className="space-y-5">
          {contactItems.filter(item => item.value).map((item, index) => (
            <motion.a 
              key={index}
              href={item.href}
              target={item.target || "_self"}
              rel={item.target === "_blank" ? "noopener noreferrer" : ""}
              className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ease-in-out group ${item.href ? 'hover:bg-primary/10 cursor-pointer' : 'cursor-default'}`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
              whileHover={item.href ? { scale: 1.02 } : {}}
            >
              <div className="p-3 rounded-full bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <item.icon size={22} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className={`font-medium text-card-foreground ${item.href ? 'group-hover:text-primary transition-colors' : ''}`}>
                  {item.value}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
        
        {contact.email && (
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Button 
              size="lg"
              className="w-full text-lg py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white glow-on-hover"
              onClick={() => window.location.href = `mailto:${contact.email}?subject=Contato Media Kit - Eu, Marko!`}
            >
              <Mail size={20} className="mr-2" /> Enviar um Email
            </Button>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default ContactSection;