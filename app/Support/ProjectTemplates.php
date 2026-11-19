<?php

namespace App\Support;

/** Modèles de projet prêts à l'emploi : tâches types avec échéance relative (en jours). */
class ProjectTemplates
{
    public static function all(): array
    {
        return [
            'website' => [
                'label' => 'Site web',
                'tasks' => [
                    ['Cadrage et objectifs du site', 'high', 3],
                    ['Arborescence et contenus', 'medium', 7],
                    ['Maquettes des pages clés', 'high', 14],
                    ['Intégration responsive', 'high', 28],
                    ['Rédaction et import des contenus', 'medium', 30],
                    ['Recette et corrections', 'high', 35],
                    ['Mise en ligne et redirections', 'critical', 40],
                    ['Suivi SEO et statistiques', 'low', 60],
                ],
            ],
            'mobile' => [
                'label' => 'Application mobile',
                'tasks' => [
                    ['Recueil des besoins et personas', 'high', 5],
                    ['Parcours utilisateur et wireframes', 'high', 12],
                    ['Design de l\'interface', 'medium', 21],
                    ['Développement du MVP', 'critical', 45],
                    ['Tests sur appareils', 'high', 52],
                    ['Publication App Store / Play Store', 'high', 60],
                ],
            ],
            'event' => [
                'label' => 'Organisation d\'événement',
                'tasks' => [
                    ['Fixer la date et le budget', 'critical', 2],
                    ['Réserver le lieu', 'high', 10],
                    ['Liste des invités et invitations', 'medium', 14],
                    ['Prestataires (traiteur, technique)', 'medium', 21],
                    ['Programme et intervenants', 'medium', 25],
                    ['Communication et relances', 'low', 28],
                    ['Jour J : check-list logistique', 'critical', 35],
                    ['Bilan et remerciements', 'low', 38],
                ],
            ],
            'sprint' => [
                'label' => 'Sprint (2 semaines)',
                'tasks' => [
                    ['Planification du sprint', 'high', 0],
                    ['Point quotidien', 'low', 1, 'daily'],
                    ['Revue de sprint', 'medium', 13],
                    ['Rétrospective', 'medium', 14],
                ],
            ],
        ];
    }
}
