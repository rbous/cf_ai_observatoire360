import { motion } from "framer-motion";
import { Play } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/app/components/ui/accordion";

const FAQ_ITEMS = [
    {
        id: "faq-1",
        question: "Comment fonctionne la détection automatique?",
        answer:
            "Notre système utilise des images satellites à haute résolution de Sentinel-2 et d'autres sources. Notre algorithme d'intelligence artificielle compare les images à différentes dates pour identifier toute nouvelle construction ou modification sur votre territoire. Lorsqu'un changement est détecté, vous recevez automatiquement une alerte avec les preuves photographiques et les informations nécessaires pour agir.",
    },
    {
        id: "faq-2",
        question: "Quelles données satellitaires utilisez-vous?",
        answer:
            "Nous utilisons principalement les données Sentinel-2 de l'ESA (Agence spatiale européenne), qui offrent une résolution de 10 mètres et une fréquence de revisite de 5 jours. Nous complétons avec d'autres sources de données disponibles au Québec pour maximiser la couverture et la précision de la détection.",
    },
    {
        id: "faq-3",
        question: "Est-ce adapté à ma municipalité?",
        answer:
            "Oui! Observatoire 360 est conçu spécifiquement pour les réalités québécoises. Notre système prend en compte les saisons, les zones humides, les espèces menacées et les mouvements de masse. Que vous soyez une petite municipalité rurale ou une ville de taille moyenne, notre solution s'adapte à votre territoire et vos besoins.",
    },
    {
        id: "faq-4",
        question: "Comment commencer?",
        answer:
            "C'est simple! Contactez-nous pour une démo gratuite personnalisée. Nous analyserons votre territoire et vous montrerons comment le système fonctionnerait dans votre contexte. Si vous souhaitez procéder, notre équipe s'occupe de tout le déploiement. Profitez de notre offre de lancement: 3 mois gratuits pour les 10 premières municipalités.",
    },
];

const TESTIMONIALS = [
    {
        municipality: "Ville de Granby",
        quote:
            "Observatoire 360 a transformé notre façon de gérer les permis de construction. Nous avons récupéré des revenus que nous ne savions même pas perdre.",
    },
    {
        municipality: "MRC des Sources",
        quote:
            "La détection automatique nous a permis d'identifier 23 constructions non conformes en seulement 3 mois. Un outil indispensable!",
    },
    {
        municipality: "Municipalité de Sainte-Julie",
        quote:
            "Notre équipe d'inspecteurs peut maintenant se concentrer sur les cas critiques. Le gain de temps est considérable.",
    },
];

function VideoPlaceholder({ label }: { label?: string }) {
    return (
        <div className="relative w-full aspect-video bg-gray-200 rounded-2xl overflow-hidden flex items-center justify-center group cursor-pointer hover:bg-gray-300 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400" />
            <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#008B8B] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
                {label && (
                    <span className="text-sm font-semibold text-gray-600">{label}</span>
                )}
            </div>
        </div>
    );
}

export default function Resources() {
    return (
        <section id="ressources" className="py-24 lg:py-32 bg-gradient-to-b from-white to-[#f0fafa]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-[#1A2332] mb-4">
                        RESSOURCES ET QUESTIONS FRÉQUENTES
                    </h2>
                    <p className="text-lg text-[#2A3A4E]/70 max-w-xl mx-auto">
                        Tout ce que vous devez savoir pour prendre votre décision
                    </p>
                    <div className="mt-4 w-16 h-1 bg-[#008B8B] mx-auto rounded-full" />
                </motion.div>

                {/* Main video */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="max-w-3xl mx-auto mb-16"
                >
                    <VideoPlaceholder label="Présentation d'Observatoire 360" />
                </motion.div>

                {/* Testimonials */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="mb-16"
                >
                    <h3 className="text-xl font-black uppercase text-[#1A2332] mb-8 text-center">
                        CE QUE DISENT NOS CLIENTS
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, index) => (
                            <motion.div
                                key={t.municipality}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white rounded-2xl shadow-md border border-[#008B8B]/10 overflow-hidden"
                            >
                                <VideoPlaceholder />
                                <div className="p-5">
                                    <p className="font-black text-[#008B8B] text-sm uppercase tracking-wide mb-2">
                                        {t.municipality}
                                    </p>
                                    <p className="text-sm text-[#2A3A4E]/80 italic leading-relaxed">
                                        "{t.quote}"
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* FAQ */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-3xl mx-auto"
                >
                    <h3 className="text-xl font-black uppercase text-[#1A2332] mb-8 text-center">
                        QUESTIONS FRÉQUENTES
                    </h3>
                    <div className="bg-white rounded-2xl shadow-md border border-[#008B8B]/10 overflow-hidden px-6">
                        <Accordion type="single" collapsible>
                            {FAQ_ITEMS.map((item) => (
                                <AccordionItem key={item.id} value={item.id}>
                                    <AccordionTrigger className="text-base font-semibold">
                                        {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-[#2A3A4E]/80 leading-relaxed">
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
