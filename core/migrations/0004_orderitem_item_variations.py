# Generated by Django 2.2.3 on 2019-10-30 18:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_auto_20191030_1601'),
    ]

    operations = [
        migrations.AddField(
            model_name='orderitem',
            name='item_variations',
            field=models.ManyToManyField(to='core.ItemVariation'),
        ),
    ]