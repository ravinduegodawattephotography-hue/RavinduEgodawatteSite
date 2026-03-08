import { motion } from 'framer-motion';
import { Facebook, Instagram, Youtube } from 'lucide-react';

// Custom TikTok Icon since lucide doesn't have it
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

// Custom WhatsApp Icon
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

const socialLinks = [
  {
    name: 'Facebook',
    icon: Facebook,
    href: 'https://www.facebook.com/ravinduegodawatte?mibextid=ZbWKwL',
    color: 'hover:text-blue-500',
  },
  {
    name: 'WhatsApp',
    icon: WhatsAppIcon,
    href: 'https://www.whatsapp.com/channel/0029Va9tk0sKmCPThj9tDU0g',
    color: 'hover:text-green-500',
  },
  {
    name: 'Instagram',
    icon: Instagram,
    href: 'https://www.instagram.com/_ravinduegodawattephotography_/',
    color: 'hover:text-pink-500',
  },
  {
    name: 'YouTube',
    icon: Youtube,
    href: 'http://www.youtube.com/@ravinduegodawatte',
    color: 'hover:text-red-500',
  },
  {
    name: 'TikTok',
    icon: TikTokIcon,
    href: 'https://www.tiktok.com/@ravinduegodawatte.lk?_t=8mpgA0s6gFO&_r=1',
    color: 'hover:text-white',
  },
];

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Portfolio', href: '#portfolio' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'Contact', href: '#contact' },
];

export default function Footer() {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative w-full bg-neutral-950 border-t border-neutral-900">
      {/* Main Footer */}
      <div className="w-full px-6 md:px-12 lg:px-20 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              className="flex items-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <img 
                src="/logo-white.png" 
                alt="Ravindu Egodawatte Photography" 
                className="h-12 w-auto"
              />
            </motion.div>
            <motion.p
              className="text-neutral-400 max-w-md mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Capturing life's most precious moments with artistry and passion. 
              Based in Sri Lanka, available worldwide for weddings, engagements, and events.
            </motion.p>

            {/* Social Links */}
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 transition-colors ${social.color}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-white font-medium mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    className="text-neutral-400 hover:text-amber-500 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-white font-medium mb-6">Contact</h4>
            <ul className="space-y-3 text-neutral-400">
              <li>
                <a
                  href="mailto:ravinduegodawatte@gmail.com"
                  className="hover:text-amber-500 transition-colors"
                >
                  ravinduegodawatte@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+94771234567"
                  className="hover:text-amber-500 transition-colors"
                >
                  +94 77 123 4567
                </a>
              </li>
              <li>Colombo, Sri Lanka</li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full px-6 md:px-12 lg:px-20 py-6 border-t border-neutral-900">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.p
            className="text-sm text-neutral-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            &copy; {new Date().getFullYear()} Ravindu Egodawatte Photography. All rights reserved.
          </motion.p>
          
          <motion.p
            className="text-sm text-neutral-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Crafted by{' '}
            <a
              href="https://code94.lk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-500/80 hover:text-amber-500 transition-colors"
            >
              Code94
            </a>
          </motion.p>
        </div>
      </div>
    </footer>
  );
}
