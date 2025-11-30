import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Paper,
  TextField,
  Typography,
  Avatar,
  Fab,
  Drawer,
  Divider,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour! Je suis l\'assistant Allo Bricolage. Comment puis-je vous aider?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const generateBotResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase().trim();

    // Greetings
    if (lowerInput.match(/^(bonjour|salut|hello|hi|bonsoir|salam|salam alaikum|ahlan|marhaba)/)) {
      return 'Bonjour! 👋 Je suis l\'assistant Allo Bricolage. Je peux vous aider à:\n\n• Trouver un technicien\n• Réserver un service\n• Obtenir des informations sur nos services\n• Répondre à vos questions\n\nQue souhaitez-vous faire aujourd\'hui?';
    }

    // Pricing questions
    if (lowerInput.match(/(prix|coût|tarif|combien|price|cost)/)) {
      return '💰 **Tarifs:**\n\nLes prix varient selon le service et le technicien:\n• **Plomberie/Électricité:** 150-500 MAD\n• **Peinture:** 300-1500 MAD\n• **Climatisation:** 250-1000 MAD\n• **Menuiserie/Maçonnerie:** 200-800 MAD\n\n💡 **Conseil:** Chaque technicien affiche ses tarifs sur son profil. Vous pouvez comparer les prix avant de réserver.\n\nPour une demande urgente, un supplément de 100 MAD s\'applique.';
    }

    // Service categories - Plomberie
    if (lowerInput.match(/(plomberie|plombier|fuite|canalisation|robinet|chauffe-eau|wc|toilette|évier|lavabo|douche|bain)/)) {
      return '🔧 **Plomberie:**\n\nNos techniciens plombiers peuvent vous aider avec:\n• Fuites d\'eau\n• Canalisations bouchées\n• Réparation de robinets\n• Installation/réparation de chauffe-eau\n• Problèmes de WC\n• Installation d\'équipements sanitaires\n\n📍 **Comment réserver:**\n1. Allez sur "Rechercher" dans le menu\n2. Sélectionnez "Plomberie" comme catégorie\n3. Choisissez votre ville\n4. Sélectionnez un technicien vérifié\n\n💡 Les techniciens vérifiés ont été approuvés par notre équipe pour garantir la qualité du service.';
    }

    // Service categories - Électricité
    if (lowerInput.match(/(électricité|électricien|électrique|panne|court-circuit|interrupteur|prise|tableau|électrique|ampoule|éclairage)/)) {
      return '⚡ **Électricité:**\n\nNos électriciens certifiés interviennent pour:\n• Pannes électriques\n• Installation de prises et interrupteurs\n• Réparation de tableaux électriques\n• Installation d\'éclairage\n• Dépannage urgent\n\n⚠️ **Important:** Pour votre sécurité, choisissez toujours un technicien vérifié et certifié.\n\n📍 **Réserver:** Menu "Rechercher" → Catégorie "Électricité" → Sélectionnez votre ville.';
    }

    // Service categories - Peinture
    if (lowerInput.match(/(peinture|peindre|peintre|mur|plafond|façade|rénovation|décoration)/)) {
      return '🎨 **Peinture:**\n\nServices disponibles:\n• Peinture intérieure et extérieure\n• Préparation des surfaces\n• Finitions professionnelles\n• Garantie 60 jours\n\n💰 **Tarifs:** 300-1500 MAD selon la surface\n⏱️ **Durée:** 2h à 1 jour\n\n📍 Pour réserver, recherchez un technicien spécialisé en peinture dans votre ville.';
    }

    // Service categories - Climatisation
    if (lowerInput.match(/(climatisation|climatiseur|ac|air conditionné|ventilation|réfrigération|froid|chaud)/)) {
      return '❄️ **Climatisation:**\n\nNos techniciens interviennent pour:\n• Installation de climatiseurs\n• Maintenance et nettoyage\n• Réparation de pannes\n• Recharge de gaz\n• Garantie 90 jours\n\n💰 **Tarifs:** 250-1000 MAD\n⏱️ **Durée:** 1h à 4h\n\n📍 Recherchez un technicien en climatisation dans votre ville pour une intervention rapide.';
    }

    // Service categories - Menuiserie
    if (lowerInput.match(/(menuiserie|menuiser|bois|porte|fenêtre|meuble|charpente|parquet|plancher)/)) {
      return '🪵 **Menuiserie:**\n\nServices proposés:\n• Fabrication et réparation de meubles\n• Installation de portes et fenêtres\n• Travaux de charpente\n• Pose de parquet\n• Rénovation bois\n\n💰 **Tarifs:** 200-800 MAD\n\n📍 Trouvez un menuisier expérimenté via la recherche.';
    }

    // Service categories - Maçonnerie
    if (lowerInput.match(/(maçonnerie|maçon|construction|mur|béton|carrelage|faïence|enduit|crépi)/)) {
      return '🧱 **Maçonnerie:**\n\nTravaux disponibles:\n• Construction et réparation de murs\n• Travaux de béton\n• Pose de carrelage et faïence\n• Enduits et crépis\n• Petits travaux de construction\n\n📍 Recherchez un maçon dans votre ville pour vos projets.';
    }

    // Service categories - Serrurerie
    if (lowerInput.match(/(serrurerie|serrurier|serrure|clé|verrou|porte|sécurité|dépannage)/)) {
      return '🔐 **Serrurerie:**\n\nServices d\'urgence et installation:\n• Dépannage serrurerie (ouverture de porte)\n• Installation de serrures\n• Duplication de clés\n• Renforcement de sécurité\n• Intervention rapide disponible\n\n🚨 **Urgence:** Pour une intervention urgente, utilisez l\'option "Demande urgente" (+100 MAD).';
    }

    // Service categories - Équipements
    if (lowerInput.match(/(équipement|électroménager|machine|réfrigérateur|lave-linge|lave-vaisselle|four|cuisinière)/)) {
      return '🔌 **Équipements & Électroménager:**\n\nRéparation de:\n• Réfrigérateurs et congélateurs\n• Lave-linge et lave-vaisselle\n• Fours et cuisinières\n• Micro-ondes\n• Autres appareils électroménagers\n\n📍 Trouvez un technicien spécialisé dans votre ville.';
    }

    // Urgent requests
    if (lowerInput.match(/(urgent|rapide|immédiat|maintenant|asap|dépannage|urgence|panne)/)) {
      return '🚨 **Intervention Urgente:**\n\nPour une intervention rapide (1h):\n1. Allez sur la page d\'accueil\n2. Cliquez sur "Demande urgente (1h)"\n3. Sélectionnez votre service\n4. Un supplément de 100 MAD s\'applique\n\n💡 Les techniciens disponibles maintenant apparaissent en premier.\n\n⏱️ **Temps d\'intervention:** 1 heure maximum\n💰 **Supplément:** 100 MAD';
    }

    // Payment methods
    if (lowerInput.match(/(paiement|payer|payement|moyen de paiement|espèces|carte|wafacash|virement|transfert)/)) {
      return '💳 **Modes de Paiement:**\n\nNous acceptons:\n• 💵 **Espèces** (liquide)\n• 💳 **Carte bancaire** (simulation Stripe)\n• 📱 **Wafacash** (simulation)\n• 🏦 **Virement bancaire**\n\n📋 **Important:**\n• Le paiement se fait **APRÈS** la complétion du travail\n• Le technicien marque le travail comme terminé\n• Vous recevez une notification pour payer\n• Une fois payé, vous pouvez noter le technicien\n\n✅ Tous les paiements sont sécurisés.';
    }

    // Booking process
    if (lowerInput.match(/(réserver|réservation|booking|commander|demander|prendre rendez-vous|appeler)/)) {
      return '📅 **Comment Réserver:**\n\n**Étape 1:** Recherchez un technicien\n• Menu "Rechercher"\n• Sélectionnez catégorie et ville\n• Consultez les profils et avis\n\n**Étape 2:** Créez votre réservation\n• Cliquez sur "Réserver"\n• Remplissez le formulaire:\n  - Description du problème\n  - Adresse complète\n  - Date et heure (optionnel)\n  - Photos (recommandé)\n\n**Étape 3:** Confirmation\n• Vérifiez le récapitulatif\n• Le technicien accepte votre demande\n• Vous recevez une notification\n\n💡 **Astuce:** Ajoutez des photos pour aider le technicien à mieux comprendre le problème.';
    }

    // Cities coverage
    if (lowerInput.match(/(ville|cities|casablanca|rabat|marrakech|fès|agadir|tanger|meknès|oujda|kenitra|tetouan|mohammedia|safi|salé|temara|beni mellal|khouribga|nador|settat|ouarzazate)/)) {
      return '📍 **Villes Couvertes:**\n\nNous couvrons **38 villes** au Maroc:\n\n**Grandes villes:**\n• Casablanca, Rabat, Marrakech\n• Fès, Agadir, Tanger\n• Meknès, Oujda, Kenitra\n\n**Autres villes:**\n• Tetouan, Mohammedia, El Jadida\n• Safi, Salé, Temara\n• Beni Mellal, Khouribga, Nador\n• Et bien d\'autres...\n\n💡 **Recherche:** Utilisez le menu "Rechercher" et sélectionnez votre ville pour voir les techniciens disponibles.';
    }

    // Account/Profile questions
    if (lowerInput.match(/(compte|profil|inscription|s'inscrire|créer un compte|enregistrer)/)) {
      return '👤 **Créer un Compte:**\n\n**Pour les clients:**\n1. Cliquez sur "S\'inscrire"\n2. Remplissez le formulaire:\n   - Nom complet\n   - Email\n   - Téléphone\n   - Ville\n   - Mot de passe\n3. Confirmez votre inscription\n\n**Pour les techniciens:**\n1. Inscrivez-vous avec le rôle "Technicien"\n2. Complétez votre profil:\n   - Compétences\n   - Années d\'expérience\n   - Tarifs\n   - Documents (pour vérification)\n3. Attendez l\'approbation admin\n\n✅ Une fois approuvé, vous pouvez accepter des réservations!';
    }

    // Verification/Trust
    if (lowerInput.match(/(vérifié|vérification|fiable|sûr|sécurisé|confiance|garantie|approuvé)/)) {
      return '✅ **Techniciens Vérifiés:**\n\nTous nos techniciens sont:\n• ✅ Vérifiés par notre équipe\n• ✅ Documents vérifiés\n• ✅ Profils complets\n• ✅ Avis clients authentiques\n\n🔒 **Sécurité:**\n• Paiement sécurisé\n• Données protégées\n• Service garanti\n\n💡 Recherchez les techniciens avec le badge "Vérifié" pour plus de confiance.';
    }

    // Reviews/Ratings
    if (lowerInput.match(/(avis|note|rating|évaluation|commentaire|review|noter)/)) {
      return '⭐ **Avis & Notes:**\n\n**Système de notation:**\n• Note de 1 à 5 étoiles\n• Commentaires clients\n• Notes visibles sur les profils\n\n**Comment noter:**\n1. Une fois le travail terminé\n2. Après le paiement\n3. Cliquez sur "Noter le technicien"\n4. Donnez une note et un commentaire\n\n💡 Les avis aident les autres clients à choisir le bon technicien.';
    }

    // Subscription for technicians
    if (lowerInput.match(/(abonnement|subscription|plan|premium|basic|trial|essai gratuit)/)) {
      return '💎 **Plans d\'Abonnement (Techniciens):**\n\n**Essai Gratuit (7 jours):**\n• 3 réservations maximum\n• Pas de priorité\n\n**Plan Basic (99 MAD/mois):**\n• Réservations illimitées\n• Listing normal\n\n**Plan Premium (199 MAD/mois):**\n• Réservations illimitées\n• Listing prioritaire\n• Badge "Premium"\n• Analytics avancées\n• Support prioritaire\n\n💡 Accédez à votre tableau de bord technicien pour gérer votre abonnement.';
    }

    // Help/Support
    if (lowerInput.match(/(aide|help|support|assistance|problème|difficulté|question|besoin d'aide)/)) {
      return '🆘 **Besoin d\'Aide?**\n\nJe peux vous aider avec:\n• ✅ Trouver un technicien\n• ✅ Réserver un service\n• ✅ Informations sur les tarifs\n• ✅ Processus de paiement\n• ✅ Questions sur les services\n\n**Autres options:**\n• Consultez la FAQ sur notre site\n• Contactez notre support\n• Vérifiez votre profil utilisateur\n\n💬 Posez-moi une question spécifique et je vous guiderai!';
    }

    // Service hours/availability
    if (lowerInput.match(/(disponible|disponibilité|horaires|heures|ouvert|fermé|weekend|week-end|samedi|dimanche)/)) {
      return '🕐 **Disponibilité:**\n\n**Techniciens en ligne:**\n• Disponibles maintenant\n• Intervention rapide possible\n• Statut visible sur leur profil\n\n**Horaires:**\n• La plupart des techniciens travaillent:\n  - Du lundi au samedi\n  - 8h-20h généralement\n  - Certains disponibles le dimanche\n\n💡 Utilisez le filtre "Disponible maintenant" pour voir les techniciens en ligne.\n\n🚨 Pour une urgence, utilisez "Demande urgente" (intervention 1h).';
    }

    // What services are available
    if (lowerInput.match(/(services|quels services|que proposez|offres|catégories|types de services)/)) {
      return '🛠️ **Nos Services:**\n\n**Services Principaux:**\n• 🔧 Plomberie\n• ⚡ Électricité\n• 🎨 Peinture\n• ❄️ Climatisation\n• 🔐 Serrurerie\n• 🪵 Menuiserie\n• 🧱 Maçonnerie\n• 🔌 Équipements (électroménager)\n• 🔥 Chauffage\n• 🧱 Carrelage\n\n📍 **Comment voir tous les services:**\n• Allez sur la page d\'accueil\n• Section "Nos Services"\n• Cliquez sur un service pour voir les détails\n\n💡 Chaque service a sa page avec description, tarifs et techniciens disponibles.';
    }

    // How it works
    if (lowerInput.match(/(comment ça marche|fonctionnement|processus|étapes|marche à suivre|procédure)/)) {
      return '📋 **Comment Ça Marche:**\n\n**1. Recherche** 🔍\n• Trouvez un technicien par service et ville\n• Consultez les profils, avis et tarifs\n\n**2. Réservation** 📅\n• Créez une réservation avec les détails\n• Ajoutez des photos du problème\n• Le technicien accepte ou décline\n\n**3. Intervention** 🔧\n• Le technicien arrive à l\'heure prévue\n• Il effectue le travail\n• Il marque le travail comme terminé\n\n**4. Paiement** 💳\n• Vous recevez une notification\n• Choisissez votre mode de paiement\n• Payez après vérification du travail\n\n**5. Avis** ⭐\n• Notez le technicien\n• Laissez un commentaire\n• Aidez les autres clients\n\n✅ C\'est simple, rapide et sécurisé!';
    }

    // Thank you
    if (lowerInput.match(/(merci|thank you|shukran|choukran|grazie|gracias)/)) {
      return 'De rien! 😊\n\nJe suis toujours là pour vous aider. N\'hésitez pas à me poser d\'autres questions!\n\nBonne journée! 🌟';
    }

    // Goodbye
    if (lowerInput.match(/(au revoir|bye|goodbye|à bientôt|à plus|ciao|adieu)/)) {
      return 'Au revoir! 👋\n\nMerci d\'avoir utilisé Allo Bricolage. Revenez quand vous voulez!\n\nBonne journée! 🌟';
    }

    // Default response with suggestions
    const suggestions = [
      'Essayez de demander: "Comment réserver un technicien?"',
      'Ou: "Quels sont vos tarifs?"',
      'Ou: "Je cherche un plombier"',
      'Ou: "Comment fonctionne le paiement?"',
    ];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    return `Je comprends votre question, mais je n'ai pas d'information spécifique à ce sujet. 🤔\n\n${randomSuggestion}\n\n💡 **Je peux vous aider avec:**\n• Recherche de techniciens\n• Processus de réservation\n• Informations sur les services\n• Questions sur les tarifs\n• Modes de paiement\n• Et bien plus!\n\nPosez-moi une question plus spécifique et je vous guiderai! 😊`;
  };

  return (
    <>
      <Fab
        color="secondary"
        aria-label="chat"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: '#F4C542',
          color: '#032B5A',
          '&:hover': { bgcolor: '#e0b038' },
          zIndex: 1000,
        }}
      >
        <ChatIcon />
      </Fab>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 }, p: 0 },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box
            sx={{
              bgcolor: '#032B5A',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar sx={{ bgcolor: '#F4C542', color: '#032B5A' }}>
              <SmartToyIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Assistant Allo Bricolage
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                En ligne
              </Typography>
            </Box>
            <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider />

          {/* Messages */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: '#f5f5f5',
            }}
          >
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '75%',
                    bgcolor: message.sender === 'user' ? '#F4C542' : 'white',
                    color: message.sender === 'user' ? '#032B5A' : 'text.primary',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1">{message.text}</Typography>
                </Paper>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          <Divider />

          {/* Input */}
          <Box sx={{ p: 2, bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tapez votre message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSend();
                  }
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!input.trim()}
                sx={{ bgcolor: '#F4C542', color: '#032B5A', '&:hover': { bgcolor: '#e0b038' } }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default ChatBot;


