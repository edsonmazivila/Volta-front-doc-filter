from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable


def br_money(value: str) -> str:
    return value


def build_pdf(output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title="Aplicativo Móvel Grupo RM – Estrutura Técnica e Custos",
        author="Grupo RM",
    )

    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "TitleCustom",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=28,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=14,
    )
    subtitle = ParagraphStyle(
        "SubtitleCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        textColor=colors.HexColor("#334155"),
        leading=16,
        spaceAfter=14,
    )
    h2 = ParagraphStyle(
        "Heading2Custom",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0B3A82"),
        spaceBefore=10,
        spaceAfter=8,
    )
    body = ParagraphStyle(
        "BodyCustom",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=16,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=8,
    )
    bullet = ParagraphStyle(
        "BulletCustom",
        parent=body,
        leftIndent=14,
        bulletIndent=4,
        spaceAfter=5,
    )
    conclusion = ParagraphStyle(
        "Conclusion",
        parent=body,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#0B3A82"),
        borderPadding=8,
    )

    story = []

    story.append(Paragraph("Aplicativo Móvel Grupo RM – Estrutura Técnica e Custos", title))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Visão Geral", h2))
    story.append(
        Paragraph(
            "O aplicativo móvel do Grupo RM foi concebido como uma extensão natural do website atual, com foco em facilitar a decisão do cliente, aumentar conversões e fortalecer o relacionamento recorrente.",
            body,
        )
    )
    story.append(
        Paragraph(
            "A implementação segue uma abordagem MVP (Produto Mínimo Viável), permitindo lançamento rápido, menor investimento inicial e evolução contínua com base em dados reais de utilização.",
            body,
        )
    )

    story.append(Paragraph("Estrutura Técnica", h2))
    story.append(
        Paragraph("A solução utiliza tecnologias modernas e amplamente adotadas no mercado, assegurando estabilidade, desempenho e manutenção simplificada:", body)
    )

    tech_rows = [
        ["Componente", "Tecnologia sugerida", "Objetivo"],
        ["Aplicativo móvel", "Flutter (Android e iOS)", "Código único para duas plataformas"],
        ["Backend", "API própria (Go ou Node.js)", "Regras de negócio e integração"],
        ["Base de dados", "PostgreSQL", "Persistência de dados segura e escalável"],
        ["Notificações", "Firebase Cloud Messaging", "Comunicação direta com utilizadores"],
        ["Mapas e rotas", "Google Maps / Mapbox", "Localização e navegação"],
        ["Infraestrutura", "Railway / Render (cloud)", "Escalabilidade progressiva"],
    ]

    tech_table = Table(tech_rows, colWidths=[4.2 * cm, 5.2 * cm, 6.2 * cm])
    tech_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B3A82")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 9.5),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F8FAFC"), colors.white]),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(tech_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Custos de Desenvolvimento", h2))
    story.append(
        Paragraph(
            "Na fase de desenvolvimento, a maior parte das ferramentas pode ser utilizada sem custos, reduzindo significativamente o investimento inicial. Os custos relevantes surgem sobretudo na publicação e operação do produto. Adicionalmente, considera-se necessário um investimento único de 25,7 € para aquisição de gateway do Railway (taxa única).",
            body,
        )
    )

    story.append(Paragraph("Custos Operacionais Estimados (mensais)", h2))
    monthly_rows = [
        ["Item", "Ferramenta / Serviço", "Custo estimado"],
        ["Servidor backend", "Railway / Render / VPS", br_money("5–15 € / mês")],
        ["Base de dados", "PostgreSQL (incluída ou separada)", br_money("0–5 € / mês")],
        ["Notificações push", "Firebase Cloud Messaging", br_money("0 €")],
        ["Mapa", "Google Maps / Mapbox (free tier)", br_money("0 €")],
        ["Chat", "Chat próprio ou ferramenta free", br_money("0 €")],
        ["Domínio (opcional)", ".com / .co.mz", br_money("~1 € / mês")],
        ["Total mensal estimado", "", br_money("6–20 € / mês")],
    ]

    monthly_table = Table(monthly_rows, colWidths=[4.0 * cm, 7.2 * cm, 4.4 * cm])
    monthly_table_style = TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B3A82")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 9.5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.HexColor("#F8FAFC"), colors.white]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#E2E8F0")),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ]
    )
    monthly_table.setStyle(monthly_table_style)
    story.append(monthly_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Custos de Publicação (não mensais)", h2))
    oneoff_rows = [
        ["Item", "Valor"],
        ["Google Play Store", "25 USD (pagamento único)"],
        ["Apple App Store", "99 USD / ano"],
    ]
    oneoff_table = Table(oneoff_rows, colWidths=[8.0 * cm, 7.6 * cm])
    oneoff_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B3A82")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F8FAFC"), colors.white]),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(oneoff_table)

    story.append(Paragraph("Benefício para o Negócio", h2))
    story.append(Paragraph("Com este investimento controlado, o Grupo RM passa a operar um canal direto de conversão e relacionamento, com impacto positivo em:", body))
    story.append(Paragraph("• Reservas e solicitações de serviço", bullet))
    story.append(Paragraph("• Visitas presenciais", bullet))
    story.append(Paragraph("• Retenção e recorrência de clientes", bullet))
    story.append(Paragraph("• Eficiência operacional", bullet))

    story.append(Spacer(1, 8))
    story.append(
        Paragraph(
            "Conclusão: é perfeitamente viável manter o aplicativo ativo no MVP com investimento mensal estimado abaixo de 25 €.",
            conclusion,
        )
    )

    doc.build(story)


if __name__ == "__main__":
    output = Path("/home/edson-mazvila/Desktop/Edson_Doricod/volta-stack/volta-front/docs/Aplicativo_Movel_Grupo_RM_Estrutura_Tecnica_e_Custos.pdf")
    build_pdf(output)
    print(f"PDF gerado em: {output}")
