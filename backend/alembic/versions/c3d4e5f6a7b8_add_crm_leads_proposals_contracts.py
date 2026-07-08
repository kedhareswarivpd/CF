"""Add CRM leads, proposals, contracts tables

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-07-08 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

lead_source = sa.Enum('website', 'contact_form', 'referral', 'campaign', 'cold_outreach', 'event', 'other', name='lead_source')
lead_status = sa.Enum('new', 'contacted', 'requirement_gathering', 'proposal_sent', 'proposal_approved', 'converted', 'disqualified', name='lead_status')
proposal_status = sa.Enum('draft', 'sent', 'viewed', 'accepted', 'rejected', name='proposal_status')
contract_status = sa.Enum('pending', 'signed', 'void', name='contract_status')


def upgrade() -> None:
    bind = op.get_bind()
    lead_source.create(bind, checkfirst=True)
    lead_status.create(bind, checkfirst=True)
    proposal_status.create(bind, checkfirst=True)
    contract_status.create(bind, checkfirst=True)

    op.create_table(
        'leads',
        sa.Column('contact_submission_id', sa.UUID(), nullable=True),
        sa.Column('company', sa.String(length=200), nullable=True),
        sa.Column('contact_name', sa.String(length=150), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=30), nullable=True),
        sa.Column('source', lead_source, nullable=False),
        sa.Column('status', lead_status, nullable=False),
        sa.Column('estimated_value', sa.Numeric(12, 2), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('owner_id', sa.UUID(), nullable=True),
        sa.Column('converted_client_id', sa.UUID(), nullable=True),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['contact_submission_id'], ['contact_submissions.id']),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id']),
        sa.ForeignKeyConstraint(['converted_client_id'], ['clients.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'proposals',
        sa.Column('lead_id', sa.UUID(), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('scope_summary', sa.Text(), nullable=False),
        sa.Column('price', sa.Numeric(12, 2), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=False),
        sa.Column('status', proposal_status, nullable=False),
        sa.Column('file_url', sa.String(length=500), nullable=True),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('viewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_by', sa.UUID(), nullable=True),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id']),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'contracts',
        sa.Column('proposal_id', sa.UUID(), nullable=False),
        sa.Column('document_url', sa.String(length=500), nullable=True),
        sa.Column('status', contract_status, nullable=False),
        sa.Column('signed_by_client_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('signed_by_company_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['proposal_id'], ['proposals.id']),
        sa.UniqueConstraint('proposal_id'),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('contracts')
    op.drop_table('proposals')
    op.drop_table('leads')

    bind = op.get_bind()
    contract_status.drop(bind, checkfirst=True)
    proposal_status.drop(bind, checkfirst=True)
    lead_status.drop(bind, checkfirst=True)
    lead_source.drop(bind, checkfirst=True)
