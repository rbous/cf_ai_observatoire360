import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { CONTACT_PHONE, CONTACT_EMAIL, CONTACT_HOURS, CONTACT_ADDRESS, CONTACT_RESPONSE_TIME } from "@/app/lib/constants";
import { api } from "@/app/lib/api";
import { useLanguage } from "@/app/hooks/useLanguage";

interface FormData {
    nom: string;
    poste: string;
    municipalite: string;
    courriel: string;
    description: string;
}

const INITIAL_FORM: FormData = {
    nom: "",
    poste: "",
    municipalite: "",
    courriel: "",
    description: "",
};

export default function Contact() {
    const { t } = useLanguage();
    const [form, setForm] = useState<FormData>(INITIAL_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await api.post("/contact", {
                name: form.nom,
                position: form.poste,
                municipality: form.municipalite,
                email: form.courriel,
                description: form.description,
            });

            setIsSubmitted(true);
            setForm(INITIAL_FORM);
        } catch {
            setError(t("contact_error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const WHY_ITEMS = [
        t("contact_why_item1"),
        t("contact_why_item2"),
        t("contact_why_item3"),
        t("contact_why_item4"),
    ];

    return (
        <section id="contact" className="py-24 lg:py-32" style={{ background: "#0F172A" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Launch offer banner */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 rounded-2xl overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #E2E8F0, #94A3B8)" }}
                >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 sm:px-8 py-5">
                        <p className="text-white font-bold text-sm sm:text-base text-center sm:text-left">
                            {t("launch_offer_text")}
                        </p>
                        <Button
                            variant="accent"
                            size="lg"
                            className="shrink-0 font-bold tracking-wide uppercase whitespace-nowrap"
                            onClick={() => {
                                const el = document.querySelector<HTMLElement>("#contact form");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            {t("contact_banner_btn")}
                        </Button>
                    </div>
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-[#E2E8F0] mb-4">
                        {t("contact_title")}
                    </h2>
                    <p className="text-lg text-[#94A3B8]/70 max-w-xl mx-auto">
                        {t("contact_subtitle")}
                    </p>
                    <div className="mt-4 w-16 h-1 bg-[#137fec] mx-auto rounded-full" />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="lg:col-span-2"
                    >
                        {isSubmitted ? (
                            <div className="h-full flex flex-col items-center justify-center gap-6 p-12 bg-slate-900 rounded-3xl shadow-none border border-[#137fec]/10 text-center">
                                <div className="w-20 h-20 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-[#10B981]" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[#E2E8F0] mb-2">{t("contact_success_title")}</h3>
                                    <p className="text-[#94A3B8]/70">
                                        {t("contact_success_body").replace("{time}", CONTACT_RESPONSE_TIME)}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsSubmitted(false)}
                                >
                                    {t("contact_send_another")}
                                </Button>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className="bg-slate-900 rounded-3xl shadow-none border border-[#137fec]/10 p-8 space-y-5"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <Input
                                        label={t("contact_field_name")}
                                        name="nom"
                                        value={form.nom}
                                        onChange={handleChange}
                                        placeholder={t("contact_placeholder_name")}
                                        required
                                    />
                                    <Input
                                        label={t("contact_field_position")}
                                        name="poste"
                                        value={form.poste}
                                        onChange={handleChange}
                                        placeholder={t("contact_placeholder_position")}
                                        required
                                    />
                                </div>
                                <Input
                                    label={t("contact_field_municipality")}
                                    name="municipalite"
                                    value={form.municipalite}
                                    onChange={handleChange}
                                    placeholder={t("contact_placeholder_municipality")}
                                    required
                                />
                                <Input
                                    label={t("contact_field_email")}
                                    name="courriel"
                                    type="email"
                                    value={form.courriel}
                                    onChange={handleChange}
                                    placeholder={t("contact_placeholder_email")}
                                    required
                                />
                                <div className="flex flex-col gap-1.5">
                                    <label
                                        htmlFor="description"
                                        className="text-sm font-medium text-[#E2E8F0]"
                                    >
                                        {t("contact_field_description")}
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder={t("contact_placeholder_description")}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:border-transparent resize-none transition-colors"
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm text-[#DC2626] bg-[#DC2626]/5 rounded-lg p-3">{error}</p>
                                )}

                                <Button
                                    type="submit"
                                    variant="accent"
                                    size="lg"
                                    disabled={isSubmitting}
                                    className="w-full font-bold tracking-wide uppercase"
                                >
                                    {isSubmitting ? t("contact_submitting") : t("contact_submit")}
                                </Button>
                            </form>
                        )}
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-col gap-6"
                    >
                        {/* Contact info card */}
                        <div className="bg-[#E2E8F0] rounded-3xl p-8 text-white">
                            <h3 className="font-black text-lg uppercase tracking-wide mb-6 text-[#D4A843]">
                                {t("contact_info_title")}
                            </h3>
                            <div className="space-y-5">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-[#137fec] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm">{CONTACT_ADDRESS}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-[#137fec] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm">{CONTACT_PHONE}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-[#137fec] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm">{CONTACT_HOURS}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-[#137fec] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm break-all">{CONTACT_EMAIL}</p>
                                        <p className="text-xs text-white/50 mt-0.5">{t("contact_response_label")} {CONTACT_RESPONSE_TIME}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Why contact card */}
                        <div className="bg-gradient-to-br from-[#137fec] to-[#0D6BD6] rounded-3xl p-8 text-white">
                            <h3 className="font-black text-lg uppercase tracking-wide mb-4">
                                {t("contact_why_title")}
                            </h3>
                            <ul className="space-y-3 text-sm">
                                {WHY_ITEMS.map((item) => (
                                    <li key={item} className="flex items-center gap-2">
                                        <span className="text-[#D4A843] font-bold">✓</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
